FROM ubuntu:latest

# Set the root user's username
ENV USERNAME=jessemillar
# Make my debug statements work/not complain
ENV TERM=xterm

# Enable sudo usage so I don't have to change my install scripts for now
RUN apt-get update && apt-get -y install sudo
RUN useradd -m $USERNAME && echo "$USERNAME:$USERNAME" | chpasswd && adduser $USERNAME sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Copy in my dotfiles
COPY . /home/$USERNAME/.dotfiles
WORKDIR /home/$USERNAME/.dotfiles

# Change to the newly created user to allow sudo in the bootstrap scripts
USER $USERNAME

# These three script mimic bootstrap.sh in a way that allows Docker layer caching to speed up debugging
RUN ./bootstrap-homebrew.sh
RUN ./bootstrap-ansible.sh
RUN ./bootstrap-ansible-playbooks.sh

# Keep the container from exiting
CMD ["/usr/bin/zsh"]
