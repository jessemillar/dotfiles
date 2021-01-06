FROM ubuntu:latest

# Set the root user's username
ENV USERNAME=jessemillar

# Enable sudo usage so I don't have to change my install scripts for now
RUN apt-get update && apt-get -y install sudo
RUN useradd -m $USERNAME && echo "$USERNAME:$USERNAME" | chpasswd && adduser $USERNAME sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER $USERNAME

# Download the handy reverb logging utility
COPY reverb-linux-amd64 /usr/local/bin/reverb
RUN sudo chmod +x /usr/local/bin/reverb
RUN reverb "Dockerfile: reverb successfully installed"

# The bootstrap-*.sh scripts used below mimic bootstrap.sh in a way that allows Docker layer caching to speed up debugging
WORKDIR /home/$USERNAME/.dotfiles
RUN reverb "Dockerfile: Setting up Homebrew"
COPY bootstrap-homebrew.sh .
RUN ./bootstrap-homebrew.sh
RUN reverb "Dockerfile: Setting up ansible"
COPY bootstrap-ansible.sh .
RUN eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && ./bootstrap-ansible.sh
# Copy in all files now that we've laid the groundwork in Docker layer caches
RUN reverb "Dockerfile: Copying all dotfiles into container"
COPY . .
# Remove the duplicate copy of the reverb binary
RUN sudo rm reverb-linux-amd64
RUN reverb "Dockerfile: Running Ansible playbooks"
RUN eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && ./bootstrap-ansible-playbooks.sh

# Keep the container from exiting
CMD ["/usr/bin/zsh"]
