FROM app-launcher-base
RUN apt-get update && apt-get install -y firefox xvfb && apt-get clean

# Create a script to start Xvfb, x11vnc, and Firefox
RUN echo '#!/bin/bash\n\
Xvfb :99 -screen 0 1024x768x16 &\n\
export DISPLAY=:99\n\
x11vnc -display :99 -forever -usepw -listen 0.0.0.0 -port 5900 &\n\
firefox --no-sandbox' > /start-firefox.sh

RUN chmod +x /start-firefox.sh
ENV DISPLAY=:99
CMD ["/bin/bash", "-c", "/start-firefox.sh"]