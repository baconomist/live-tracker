/*
 * Copyright (C) The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.lucas.codescanner;

import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.app.Activity;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.vision.barcode.Barcode;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * Main activity demonstrating how to pass extra parameters to an activity that
 * reads barcodes.
 */
public class MainActivity extends Activity implements View.OnClickListener {

    // use a compound button so either checkbox or switch widgets work.
    private CompoundButton autoFocus;
    private CompoundButton useFlash;
    private TextView statusMessage;
    private TextView barcodeValue;

    private TextView ipAddressInput;
    private Button sendToServerBtn;

    private String server_url;

    private static final int RC_BARCODE_CAPTURE = 9001;
    private static final String TAG = "BarcodeMain";

    public static MainActivity context;

    private String current_vehicle = "";
    private ArrayList<String> barcodes = new ArrayList<String>();

    private MediaPlayer mediaPlayer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        MainActivity.context = this;

        mediaPlayer = MediaPlayer.create(this, R.raw.beep);

        statusMessage = (TextView) findViewById(R.id.status_message);
        barcodeValue = (TextView) findViewById(R.id.barcode_value);

        autoFocus = (CompoundButton) findViewById(R.id.auto_focus);
        useFlash = (CompoundButton) findViewById(R.id.use_flash);

        ipAddressInput = (TextView) findViewById(R.id.ip_address);
        server_url = "" + ipAddressInput.getText();
        ipAddressInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                server_url = "" + s;
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        sendToServerBtn = (Button) findViewById(R.id.send_to_server);
        sendToServerBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final TextView textView = (TextView) findViewById(R.id.text);

                // Instantiate the RequestQueue.
                RequestQueue queue = Volley.newRequestQueue(context);
                String url = server_url;

                JSONObject json = new JSONObject();
                try {
                    json.put(current_vehicle, barcodes);
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, url, json,
                        new Response.Listener<JSONObject>() {
                            @Override
                            public void onResponse(JSONObject response) {
                                Log.i("Network", "String Response : " + response.toString());
                            }
                        }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.i("Network", "Error getting response");
                    }
                });
                jsonObjectRequest.setTag("AAAA");

                // Add the request to the RequestQueue.
                queue.add(jsonObjectRequest);

                // Clear barcodes and vehicle
                current_vehicle = "";
                barcodes.clear();

                Log.i("Network", "Sent Barcodes to: " + server_url);
            }

        });

        findViewById(R.id.read_barcode).setOnClickListener(this);
    }

    /**
     * Called when a view has been clicked.
     *
     * @param v The view that was clicked.
     */
    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.read_barcode) {
            // launch barcode activity.
            Intent intent = new Intent(this, BarcodeCaptureActivity.class);
            intent.putExtra(BarcodeCaptureActivity.AutoFocus, autoFocus.isChecked());
            intent.putExtra(BarcodeCaptureActivity.UseFlash, useFlash.isChecked());

            startActivityForResult(intent, RC_BARCODE_CAPTURE);
        }

    }

    /**
     * Called when an activity you launched exits, giving you the requestCode
     * you started it with, the resultCode it returned, and any additional
     * data from it.  The <var>resultCode</var> will be
     * {@link #RESULT_CANCELED} if the activity explicitly returned that,
     * didn't return any result, or crashed during its operation.
     * <p/>
     * <p>You will receive this call immediately before onResume() when your
     * activity is re-starting.
     * <p/>
     *
     * @param requestCode The integer request code originally supplied to
     *                    startActivityForResult(), allowing you to identify who this
     *                    result came from.
     * @param resultCode  The integer result code returned by the child activity
     *                    through its setResult().
     * @param data        An Intent, which can return result data to the caller
     *                    (various data can be attached to Intent "extras").
     * @see #startActivityForResult
     * @see #createPendingResult
     * @see #setResult(int)Intent intent = new Intent(this, BarcodeCaptureActivity.class);
     * intent.putExtra(BarcodeCaptureActivity.AutoFocus, autoFocus.isChecked());
     * intent.putExtra(BarcodeCaptureActivity.UseFlash, useFlash.isChecked());
     * <p>
     * startActivityForResult(intent, RC_BARCODE_CAPTURE);
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == RC_BARCODE_CAPTURE) {
            if (resultCode == CommonStatusCodes.SUCCESS) {
                if (data != null) {
                    Barcode barcode = data.getParcelableExtra(BarcodeCaptureActivity.BarcodeObject);
                    statusMessage.setText(R.string.barcode_success);
                    barcodeValue.setText(barcode.displayValue);

                    Log.d(TAG, "Barcode read: " + barcode.displayValue);
                } else {
                    statusMessage.setText(R.string.barcode_failure);
                    Log.d(TAG, "No barcode captured, intent data is null");
                }
            } else {
                statusMessage.setText(String.format(getString(R.string.barcode_error),
                        CommonStatusCodes.getStatusCodeString(resultCode)));
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    public void receiveBarcode(Barcode barcode) {
        if (barcode.displayValue.toLowerCase().contains("truck") || barcode.displayValue.toLowerCase().contains("train") || barcode.displayValue.toLowerCase().contains("ship"))
            current_vehicle = barcode.displayValue;
        else if (!barcodes.contains(barcode.displayValue))
            barcodes.add(barcode.displayValue);

       /* ((AudioManager) getSystemService(Context.AUDIO_SERVICE)).setStreamVolume(AudioManager.STREAM_MUSIC, 100, 1);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ((Vibrator) getSystemService(Context.VIBRATOR_SERVICE)).vibrate(VibrationEffect.createOneShot(250, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            ((Vibrator) getSystemService(Context.VIBRATOR_SERVICE)).vibrate(250);
        }
        mediaPlayer.start();*/
    }
}
