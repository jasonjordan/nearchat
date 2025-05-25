using System;
using System.Threading; // Required for Thread.Sleep
using NAudio.Wave;

class Program
{
    static WaveInEvent waveIn;
    static WaveOutEvent waveOut;
    static BufferedWaveProvider bufferedWaveProvider;
    static WaveFormat waveFormat;
    const int delayInSeconds = 7;

    private static int SelectAudioDevice(bool isInputDevice)
    {
        string deviceType = isInputDevice ? "input" : "output";
        int deviceCount = isInputDevice ? WaveInEvent.DeviceCount : WaveOutEvent.DeviceCount;

        Console.WriteLine($"\nListing available audio {deviceType} devices...");
        if (deviceCount == 0)
        {
            Console.WriteLine($"No audio {deviceType} devices found.");
            return -1; // Indicate no device available
        }

        for (int i = 0; i < deviceCount; i++)
        {
            var deviceInfo = isInputDevice ? WaveInEvent.GetCapabilities(i) : WaveOutEvent.GetCapabilities(i);
            Console.WriteLine($"{deviceType} Device {i}: {deviceInfo.ProductName}");
        }

        Console.Write($"Enter the number of the {deviceType} device you want to use (0-{deviceCount - 1}): ");
        string input = Console.ReadLine();
        if (int.TryParse(input, out int deviceNumber) && deviceNumber >= 0 && deviceNumber < deviceCount)
        {
            Console.WriteLine($"Selected {deviceType} device {deviceNumber}: {(isInputDevice ? WaveInEvent.GetCapabilities(deviceNumber).ProductName : WaveOutEvent.GetCapabilities(deviceNumber).ProductName)}");
            return deviceNumber;
        }
        else
        {
            Console.WriteLine($"Invalid selection. Defaulting to {deviceType} device 0.");
            return 0;
        }
    }

    static void Main(string[] args)
    {
        // Define audio format
        int sampleRate = 44100;
        int bits = 16;
        int channels = 2;
        waveFormat = new WaveFormat(sampleRate, bits, channels);

        // --- Input Device Selection ---
        int inputDeviceNumber = SelectAudioDevice(true);
        if (inputDeviceNumber == -1)
        {
            Console.WriteLine("Cannot proceed without an input audio device. Exiting.");
            return;
        }

        // --- Output Device Selection ---
        int outputDeviceNumber = SelectAudioDevice(false);
        if (outputDeviceNumber == -1)
        {
            Console.WriteLine("Cannot proceed without an output audio device. Exiting.");
            return;
        }

        // Calculate buffer size for 7 seconds of audio
        int bytesPerSample = bits / 8;
        int bufferSize = sampleRate * bytesPerSample * channels * delayInSeconds;

        // Create BufferedWaveProvider
        bufferedWaveProvider = new BufferedWaveProvider(waveFormat);
        bufferedWaveProvider.BufferLength = bufferSize;
        bufferedWaveProvider.DiscardOnBufferOverflow = true;

        // Initialize WaveInEvent
        waveIn = new WaveInEvent();
        waveIn.DeviceNumber = inputDeviceNumber; // Use selected input device
        waveIn.WaveFormat = waveFormat;
        waveIn.DataAvailable += WaveIn_DataAvailable;

        // Initialize WaveOutEvent
        waveOut = new WaveOutEvent();
        waveOut.DeviceNumber = outputDeviceNumber; // Use selected output device
        
        try
        {
            waveOut.Init(bufferedWaveProvider);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing audio output: {ex.Message}");
            if (waveIn != null) waveIn.Dispose();
            if (waveOut != null) waveOut.Dispose();
            return;
        }

        try
        {
            Console.WriteLine($"\nStarting recording using input device {inputDeviceNumber} and output device {outputDeviceNumber}.");
            Console.WriteLine($"Will buffer for {delayInSeconds} seconds...");
            waveIn.StartRecording(); // Start recording

            Console.WriteLine("Buffering audio...");
            while (bufferedWaveProvider.BufferedDuration.TotalSeconds < delayInSeconds)
            {
                Console.Write($"\rBuffering... {bufferedWaveProvider.BufferedDuration.TotalSeconds:F2} / {delayInSeconds:F2} seconds");
                Thread.Sleep(100); // Wait for 100ms to avoid tight loop and allow UI to update
            }
            Console.WriteLine($"\nBuffer filled ({bufferedWaveProvider.BufferedDuration.TotalSeconds:F2} seconds). Starting playback.");
            
            waveOut.Play(); // Start playback AFTER buffer is filled

            Console.WriteLine("Playback started. Press Enter to stop recording and playback...");
            Console.ReadLine();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred during recording/playback: {ex.Message}");
        }
        finally
        {
            Console.WriteLine("Stopping recording and playback...");
            
            if (waveIn != null)
            {
                waveIn.StopRecording();
                waveIn.Dispose();
                waveIn = null;
            }
            
            if (waveOut != null)
            {
                waveOut.Stop();
                waveOut.Dispose();
                waveOut = null;
            }
            Console.WriteLine("Recording and playback stopped, resources released.");
        }
    }

    static void WaveIn_DataAvailable(object sender, WaveInEventArgs e)
    {
        if (bufferedWaveProvider != null && e.BytesRecorded > 0)
        {
            bufferedWaveProvider.AddSamples(e.Buffer, 0, e.BytesRecorded);
        }
    }
}
