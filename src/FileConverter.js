import React, { useState } from 'react';
import axios from 'axios';
import CustomModal from './CustomModal';
import './FileConverter.css'; // Import the CSS file

// Azure OpenAI API setup
const azureOpenAIEndpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const azureOpenAIApiKey = process.env.REACT_APP_AZURE_OPENAI_API_KEY;

const FileConverter = () => {
    const [inputFormat, setInputFormat] = useState('');
    const [outputFormat, setOutputFormat] = useState('');
    const [file, setFile] = useState(null);
    const [instructions, setInstructions] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // State to store converted file content
    const [convertedFileContent, setConvertedFileContent] = useState('');

    // State to control displaying the converted file section
    const [showConvertedFile, setShowConvertedFile] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        fileFormatError: '',
        fileRequiredError: '',
        sameFormatError: '',
        instructionsRequiredError: ''
    });

    const handleFileChange = (event) => {
        // setFile(event.target.files[0]);
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        // Validate file format
        const selectedFileExtension = selectedFile.name.split('.').pop();
        if (selectedFileExtension !== inputFormat.slice(1)) {
            setValidationErrors(prevErrors => ({
                ...prevErrors,
                fileFormatError: `Selected file format must be ${inputFormat}`
            }));
        } else {
            setValidationErrors(prevErrors => ({
                ...prevErrors,
                fileFormatError: ''
            }));
        }
    };

    const validateFields = () => {
        let isValid = true;
        const errors = {
            fileFormatError: '',
            fileRequiredError: '',
            sameFormatError: '',
            instructionsRequiredError: ''
        };

        // Validate file format
        const selectedFileExtension = file ? file.name.split('.').pop() : '';
        if (!file || selectedFileExtension !== inputFormat.slice(1)) {
            errors.fileFormatError = `Selected file format must be ${inputFormat}`;
            isValid = false;
        }

        // Validate file is selected
        if (!file) {
            errors.fileRequiredError = 'File is required';
            isValid = false;
        }

        // Validate instructions field
        if (!instructions.trim()) {
            errors.instructionsRequiredError = 'Instructions are required';
            isValid = false;
        }

        // Both input and output formats are same
        if (inputFormat === outputFormat) {
            errors.sameFormatError = 'Change the output format';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const convertFileWithAzureOpenAI = async (fileContent, instructions) => {
        try {
            const response = await axios.post(
                `${azureOpenAIEndpoint}/openai/deployments/gpt-35/chat/completions?api-version=2023-05-15&api-key=${azureOpenAIApiKey}&api-type=azure`,
                {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system",
                            "content": instructions
                        },
                        {
                            "role": "user",
                            "content": fileContent
                        }
                    ]
                }
            );

            return response.data.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Error during Azure OpenAI API call:', error);
            throw new Error('Failed to convert file using Azure OpenAI');
        }
    };

    const handleConvert = async () => {
        // Validate all fields
        if (!validateFields()) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileContent = e.target.result;
            try {
                const convertedContent = await convertFileWithAzureOpenAI(fileContent, instructions);
                // Assuming the response.data contains the converted file content
                setConvertedFileContent(convertedContent);
                setShowConvertedFile(true);
                setModalMessage('Conversion completed!');
                setModalOpen(true);
            } catch (error) {
                console.error('Error converting file:', error);
                setModalMessage('Error converting file. Check console for details.');
                setModalOpen(true);
            }
        };
        reader.readAsText(file); // Read file content as text
    };

    const handleDownload = () => {
        // Create a Blob from the converted file content
        const blob = new Blob([convertedFileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Create a link element to initiate the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.split('.')[0]}.${outputFormat.slice(1)}`; // Set the appropriate file extension
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const isConvertButtonDisabled = () => {
        return (
            !file ||
            file.name.split('.').pop() !== inputFormat.slice(1) ||
            !instructions.trim() || (inputFormat === outputFormat)
        );
    };

    return (
        <div className="container">
            <h1>File Converter</h1>
            <select onChange={(e) => setInputFormat(e.target.value)} value={inputFormat}>
                <option value="" disabled>Select input format</option>
                <option value=".java">.java</option>
                <option value=".swift">.swift</option>
            </select>
            <input type="file" onChange={handleFileChange} required />
            {validationErrors.fileFormatError && <p className="error">{validationErrors.fileFormatError}</p>}
            <select onChange={(e) => setOutputFormat(e.target.value)} value={outputFormat}>
                <option value="" disabled>Select output format</option>
                <option value=".swift">.swift</option>
                <option value=".java">.java</option>
            </select>
            {validationErrors.sameFormatError && <p className="error">{validationErrors.sameFormatError}</p>}
            <input
                type="text"
                placeholder="Additional instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
            />
            <button onClick={handleConvert} disabled={isConvertButtonDisabled()}>Convert</button>

            {showConvertedFile && (
                <div>
                    <h2>Converted File Content</h2>
                    <pre>{convertedFileContent}</pre>
                    <button onClick={handleDownload}>Download Converted File</button>
                </div>
            )}

            <CustomModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={modalMessage}
            />
        </div>
    );
};

export default FileConverter;
