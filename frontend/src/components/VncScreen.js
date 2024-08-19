import React, { useEffect, useRef, useState } from 'react';
import RFB from '@novnc/novnc/lib/rfb';

function VncScreen({ host, port, password }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const rfbRef = useRef(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    const connectVNC = () => {
      const wsUrl = `ws://${host}:5000/vnc?port=${port}`;
      console.log(`Attempting to connect to VNC server at ${wsUrl}`);
      try {
        if (rfbRef.current) {
          rfbRef.current.disconnect();
        }
        rfbRef.current = new RFB(canvasRef.current, wsUrl, {
          credentials: { password },
          wsProtocols: ['binary'],
        });

        rfbRef.current.addEventListener("connect", () => {
          console.log("Connected to VNC server");
          console.log("Connection details:", rfbRef.current._fbWidth, rfbRef.current._fbHeight);
          setError(null);
          retryCountRef.current = 0;
        });

        rfbRef.current.addEventListener("disconnect", (e) => {
          console.log("Disconnected from VNC server", e);
          console.error('VNC disconnection details:', {
            clean: e.detail.clean,
            reason: e.detail.reason,
            evt: e
          });
          setError(`Disconnected from VNC server: ${e.detail.reason}`);
          if (retryCountRef.current < 3) {
            retryCountRef.current++;
            setTimeout(connectVNC, 2000);
          }
        });

        rfbRef.current.addEventListener("securityfailure", (e) => {
          console.error("Security failure:", e);
          setError(`VNC security failure: ${e.detail.reason}`);
        });

        rfbRef.current.addEventListener("credentialsrequired", () => {
          console.log("Credentials required");
          setError("VNC server requires authentication");
        });

        rfbRef.current.addEventListener("securityfailure", (e) => {
          console.error("Security failure:", e);
          setError(`VNC security failure: ${e.detail.reason}`);
        });

        rfbRef.current.addEventListener("capabilities", (e) => {
          console.log("VNC capabilities:", e.detail.capabilities);
        });

        rfbRef.current.addEventListener("clipboard", (e) => {
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
      if (rfbRef.current) {
        rfbRef.current.disconnect();
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