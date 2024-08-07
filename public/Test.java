package com.example.genai2;
import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
  TextView tv2 = (TextView) view.findViewById(R.id.textView1);
tv2.setText('TEST GEN AI');  
}
}