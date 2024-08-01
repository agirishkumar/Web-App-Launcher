FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    x11vnc \
    xvfb \
    fluxbox \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir ~/.vnc
RUN x11vnc -storepasswd 1234 ~/.vnc/passwd

# Add a script to run Xvfb, fluxbox and x11vnc
RUN echo '#!/bin/bash\nXvfb :0 -screen 0 1024x768x16 &\nfluxbox &\nx11vnc -forever -usepw -create' > /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5900

CMD ["/entrypoint.sh"]