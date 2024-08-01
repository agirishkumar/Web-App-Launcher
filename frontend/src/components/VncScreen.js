import React, { useEffect, useRef, useState } from 'react';
import RFB from '@novnc/novnc/lib/rfb';

function VncScreen({ host, port, password }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let rfb = null;

    const connectVNC = () => {
      const wsUrl = `ws://${host}:5000/vnc?port=${port}`;
      console.log(`Attempting to connect to VNC server at ${wsUrl}`);

      try {
        rfb = new RFB(canvasRef.current, wsUrl, {
          credentials: { password }
        });

        rfb.addEventListener("connect", () => {
          console.log("Connected to VNC server");
          setError(null);
        });

        rfb.addEventListener("disconnect", (e) => {
          console.log("Disconnected from VNC server", e);
          setError(`Disconnected from VNC server: ${e.detail.reason}`);
        });

        rfb.addEventListener("credentialsrequired", () => {
          console.log("Credentials required");
          setError("VNC server requires authentication");
        });

        rfb.addEventListener("securityfailure", (e) => {
          console.error("Security failure:", e);
          setError(`VNC security failure: ${e.detail.reason}`);
        });

        rfb.addEventListener("capabilities", (e) => {
          console.log("VNC capabilities:", e.detail.capabilities);
        });

        rfb.addEventListener("clipboard", (e) => {
          console.log("Clipboard event:", e.detail.text);
        });

      } catch (error) {
        console.error("Error creating RFB object:", error);
        setError(`Failed to create VNC connection: ${error.message}`);
      }
    };

    if (host && port && password) {
      connectVNC();
    } else {
      setError("Missing VNC connection details");
    }

    return () => {
      if (rfb) {
        rfb.disconnect();
      }
    };
  }, [host, port, password]);

  return (
    <div>
      <div ref={canvasRef} style={{width: '800px', height: '600px', border: '1px solid black'}}></div>
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}

export default VncScreen;