FROM ubuntu:latest

# Set the root user's username
ENV USERNAME=jessemillar

# Add support for special characters by generating locale files
RUN apt-get update && apt-get -y install locales locales-all
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Enable sudo usage so I don't have to change my install scripts for now
RUN apt-get update && apt-get -y install sudo
RUN useradd -m $USERNAME && echo "$USERNAME:$USERNAME" | chpasswd && adduser $USERNAME sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER $USERNAME

# Download the handy reverb logging utility
COPY --chown=$USERNAME:$USERNAME reverb-linux-amd64 /usr/local/bin/reverb
RUN sudo chmod +x /usr/local/bin/reverb
RUN reverb "Dockerfile: reverb successfully installed"

# The bootstrap-*.sh scripts used below mimic bootstrap.sh in a way that allows Docker layer caching to speed up debugging
RUN mkdir /home/$USERNAME/.dotfiles
WORKDIR /home/$USERNAME/.dotfiles
RUN reverb "Dockerfile: Setting up Homebrew"
COPY --chown=$USERNAME:$USERNAME bootstrap-homebrew.sh .
RUN ./bootstrap-homebrew.sh
RUN reverb "Dockerfile: Setting up ansible"
COPY --chown=$USERNAME:$USERNAME bootstrap-ansible.sh .
RUN eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && ./bootstrap-ansible.sh
# Copy in all files now that we've laid the groundwork in Docker layer caches
RUN reverb "Dockerfile: Copying all dotfiles into container"
COPY --chown=$USERNAME:$USERNAME . .
# Remove the duplicate copy of the reverb binary
RUN sudo rm reverb-linux-amd64
RUN reverb "Dockerfile: Running Ansible playbooks"
RUN eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && ./bootstrap-ansible-playbooks.sh

# Keep the container from exiting
ENTRYPOINT ["tail", "-f", "/dev/null"]

