FROM ubuntu:latest

# Set the root user's username
ENV USERNAME=jessemillar

# Enable sudo usage so I don't have to change my install scripts for now
RUN apt-get update && apt-get -y install sudo
RUN useradd -m $USERNAME && echo "$USERNAME:$USERNAME" | chpasswd && adduser $USERNAME sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER $USERNAME

# Copy in my dotfiles
COPY . /home/$USERNAME/.dotfiles

# Make my debug statements work/not complain
ENV TERM=xterm

# Install everything
WORKDIR /home/$USERNAME/.dotfiles
RUN ./bootstrap.sh

# Keep the container from exiting
CMD ["/usr/bin/zsh"]
