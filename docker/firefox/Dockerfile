FROM app-launcher-base

RUN apt-get update && apt-get install -y firefox && apt-get clean

# Create a script to start Xvfb, x11vnc, and Firefox
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Starting Xvfb..."\n\
Xvfb :99 -screen 0 1280x1024x24 &\n\
sleep 2\n\
echo "Xvfb started"\n\
export DISPLAY=:99\n\
echo "Starting x11vnc..."\n\
x11vnc -display :99 -forever -usepw -create -xkb -noxrecord -noxfixes -noxdamage -rfbport 5900 &\n\
echo "x11vnc started"\n\
echo "Starting Firefox..."\n\
firefox --no-sandbox\n\
echo "Firefox started"\n\
' > /start-firefox.sh

RUN chmod +x /start-firefox.sh

ENV DISPLAY=:99

EXPOSE 5900

CMD ["/bin/bash", "-c", "/start-firefox.sh"]