FROM ubuntu:latest

# Set the root user's username
ENV USERNAME=jessemillar
# Make my debug statements work/not complain
ENV TERM=xterm

# Enable sudo usage so I don't have to change my install scripts for now
RUN apt-get update && apt-get -y install sudo
RUN useradd -m $USERNAME && echo "$USERNAME:$USERNAME" | chpasswd && adduser $USERNAME sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER $USERNAME

# The bootstrap-*.sh scripts used below mimic bootstrap.sh in a way that allows Docker layer caching to speed up debugging
WORKDIR /home/$USERNAME/.dotfiles
# Copy in zsh functions the bootstrap-*.sh scripts use
COPY zsh zsh
RUN source zsh/.functionsrc
COPY bootstrap-homebrew.sh .
RUN source bootstrap-homebrew.sh
COPY bootstrap-ansible.sh .
RUN source bootstrap-ansible.sh
# Copy in all files now that we've laid the groundwork in Docker layer caches
COPY . .
COPY bootstrap-ansible-playbooks.sh .
RUN source bootstrap-ansible-playbooks.sh

# Keep the container from exiting
CMD ["/usr/bin/zsh"]
