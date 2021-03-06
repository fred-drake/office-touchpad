import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Countdown, { zeroPad } from 'react-countdown';
import axios from 'axios';
import env from 'react-dotenv';
import './styles.css';

function App() {
  var timerApi = null;
  
  const [ totalTimerTime, setTotalTimerTime ] = useState(Date.now() + 20000);
  const [ timerStarted, setTimerStarted ] = useState(false);
  const [ scanDocumentDisabled, setScanDocumentDisabled ] = useState(false);
  const [ errorMessage, setErrorMessage ] = useState("");

  const { nodeRedUrlPrefix, scannerUrlPrefix } = window['runConfig'];

  const restartKiosk = async () => {
      await axios.get(
          nodeRedUrlPrefix + '/kiosk-restart'
      );
  };

  const chargeDevice1 = async () => {
      setTotalTimerTime(Date.now() + 1000 * 60 * 40); // 40 minutes
      timerApi.start();
      await axios.get(
        nodeRedUrlPrefix + '/charge-device-1'
      );
  };

  const chargeDevice2 = async () => {
    setTotalTimerTime(Date.now() + 1000 * 60 * 60 * 2); // 2 hours
    timerApi.start();
    await axios.get(
      nodeRedUrlPrefix + '/charge-device-2'
    );
  };

  const tvOff = async () => {
    await axios.get(
      nodeRedUrlPrefix + '/office-tv/off'
    );
  };

  const tvKiosk = async () => {
    await axios.get(
      nodeRedUrlPrefix + '/office-tv/kiosk'
    );
  };

  const tvSwitch = async () => {
    await axios.get(
      nodeRedUrlPrefix + '/office-tv/switch'
    );
  };

  const officeLampToggle = async () => {
    await axios.get(
      nodeRedUrlPrefix + '/office-lamp/toggle'
    );
  };

  const scanDocument = async () => {
    try {
      console.log("Executing scan...");
      setScanDocumentDisabled(true);
      await axios.get(
        scannerUrlPrefix + '/scan'
      );
  
      setTimeout(() => {
        // Wait for env.REACT_APP_SCANNER to start running before checking
        console.log("Waiting 7 seconds...")
      }, 7000);
  
      // Check status
      const intervalID = setInterval( async () => {
        console.log("Checking status...");
        const response = await axios.get(scannerUrlPrefix + '/status');
        if (response.data && !response.data.running) {
          setScanDocumentDisabled(false);
          clearInterval(intervalID);
          console.log("env.REACT_APP_SCANNER is ready again!");
        }
      }, 1000);  
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const onTimerStart = async () => {
    setTimerStarted(true);
  }

  const Completionist = () => <span>Not actively charging</span>;

  const timerRenderer = ({ hours, minutes, seconds, completed, api}) => {
    timerApi = api;
    if (completed || !timerStarted) {
      return <Completionist />
    } else {
      return <span><span class="charging_label">Charging:</span> {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>
    }
  }

  useEffect(() => {
    console.log("In effect...")
    const interval = setInterval(async () => {
      console.log("Checking scanner device status each minute...")
      const response = await axios.get(scannerUrlPrefix + '/status');
        if (response.data && !response.data.deviceAvailable) {
          setErrorMessage("Scanner Device Not Connected");
        } else {
          setErrorMessage("");
        }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      {/* Fetch data from API */}
      <div>
        <button className="fetch-button" onClick={chargeDevice1}>
          Charge 40 Minutes
        </button>
        <button className="fetch-button" onClick={chargeDevice2}>
          Charge 2 Hours
        </button>
        <br />
        <button className="fetch-button" onClick={tvKiosk}>
          TV - Kiosk
        </button>
        <button className="fetch-button" onClick={tvSwitch}>
          TV - Switch
        </button>
        <br />
        <button className="fetch-button" onClick={tvOff}>
          Turn off TV
        </button>
        <button className="fetch-button" onClick={restartKiosk}>
          Restart Kiosk
        </button>
        <br />
        <button className="fetch-button" onClick={officeLampToggle}>
          Toggle Office Lamp
        </button>
        <button className='fetch-button' onClick={scanDocument} disabled={scanDocumentDisabled}>
          Scan Document
        </button>
        <div class="timer">
          <Countdown 
              date={totalTimerTime} 
              autoStart={false}
              renderer={timerRenderer}
              onStart={onTimerStart}
          />
        </div>
        <div class="error-message">{errorMessage}</div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
