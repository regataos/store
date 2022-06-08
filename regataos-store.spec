Name: regataos-store
Version: 22.1
Release: 0
Url: https://github.com/regataos/store
Summary: Application store of Regata OS
Group: System/GUI/KDE
BuildRequires: xz
BuildRequires: desktop-file-utils
BuildRequires: update-desktop-files
BuildRequires: hicolor-icon-theme
BuildRequires: -post-build-checks
%{?systemd_requires}
BuildRequires: systemd
BuildRequires: grep
License: MIT
Source1: regataos-store-%{version}.tar.xz
Source2: regataos-store.desktop.txt
Requires: regataos-repo >= 22.0
Requires: xz
Requires: xdpyinfo
Requires: magma >= 6.64.1
Requires: zypper
Requires: xdg-desktop-portal
Requires: lsof
Requires: zenity
Requires: zenity-lang
Requires: pv
Requires: libnotify4
Requires: libnotify4-32bit
Requires: libnotify-tools
Requires: regataos-snapd
Requires: regataos-flatpak
BuildRoot: %{_tmppath}/%{name}-%{version}-build

%description
Application store of Regata OS.

%build

%install
# Install the main store package
mkdir -p %{buildroot}/opt/regataos-base/
cp -f %{SOURCE1} %{buildroot}/opt/regataos-base/regataos-store-%{version}.tar.xz

mkdir -p %{buildroot}/opt/regataos-store/
cp -f %{SOURCE2} %{buildroot}/opt/regataos-store/%{name}.desktop

%post
# Extract store files at the root of the system
tar xf /opt/regataos-base/regataos-store-%{version}.tar.xz -C /

# Prepare store status
if test ! -e "/tmp/regataos-store/config" ; then
	user=$(users | awk '{print $1}')
 
	mkdir -p "/tmp/regataos-store"
	ln -sf "/home/$user/.config/regataos-store" "/tmp/regataos-store/config"
	chmod 777 "/tmp/regataos-store/config"
	chmod 777 /tmp/regataos-store/config/*

else
	user=$(users | awk '{print $1}')

	rm -rf "/tmp/regataos-store/config"
	ln -sf "/home/$user/.config/regataos-store" "/tmp/regataos-store/config"
	chmod 777 "/tmp/regataos-store/config"
	chmod 777 /tmp/regataos-store/config/*
fi

# Fix installed apps
if test ! -e "/tmp/regataos-store/config/installed-apps.txt" ; then
  user=$(users | awk '{print $1}')
  mkdir -p "/home/$user/.config/regataos-store"
  chmod 777 "/home/$user/.config/regataos-store"
  echo "" >> "/home/$user/.config/regataos-store/installed-apps.txt"
  chmod 777 /home/$user/.config/regataos-store/*

	ln -sf "/home/$user/.config/regataos-store/installed-apps.txt" "/tmp/regataos-store/config/"
	chmod 777 /tmp/regataos-store/config/*
fi

# Create directory containing the list of installed apps
mkdir -p "/opt/regataos-store/installed-apps"
chmod 777 "/opt/regataos-store/installed-apps"

# Hide YaST .desktop files
if [[ $(grep -r "NoDisplay=true" "/usr/share/applications/org.opensuse.yast.Packager.desktop") != *"NoDisplay=true"* ]]; then
  echo "NoDisplay=true" >> /usr/share/applications/org.opensuse.yast.Packager.desktop
fi

if [[ $(grep -r "NoDisplay=true" "/usr/share/applications/YaST2/org.opensuse.yast.CheckMedia.desktop") != *"NoDisplay=true"* ]]; then
  echo "NoDisplay=true" >> /usr/share/applications/YaST2/org.opensuse.yast.CheckMedia.desktop
fi

if [[ $(grep -r "NoDisplay=true" "/usr/share/applications/YaST2/org.opensuse.yast.SWSingle.desktop") != *"NoDisplay=true"* ]]; then
  echo "NoDisplay=true" >> /usr/share/applications/YaST2/org.opensuse.yast.SWSingle.desktop
fi

if [[ $(grep -r "NoDisplay=true" "/usr/share/applications/YaST2/org.opensuse.yast.SWSource.desktop") != *"NoDisplay=true"* ]]; then
  echo "NoDisplay=true" >> /usr/share/applications/YaST2/org.opensuse.yast.SWSource.desktop
fi

if [[ $(grep -r "NoDisplay=true" "/usr/share/applications/YaST2/org.opensuse.yast.OnlineUpdate.desktop") != *"NoDisplay=true"* ]]; then
  echo "NoDisplay=true" >> /usr/share/applications/YaST2/org.opensuse.yast.OnlineUpdate.desktop
fi

# Add guest user group
getent group guest-session >/dev/null || groupadd -r guest-session

# Setting the Regata OS Store language
sudo /opt/regataos-store/scripts/select-language
update-desktop-database

# We're finished!
rm -f "/opt/regataos-store/installed-apps/snap-version-cache.txt"
rm -f "/opt/regataos-store/installed-apps/flatpak-version-cache.txt"
exit 0

%clean

%files
%defattr(-,root,root)
/opt/regataos-base
/opt/regataos-base/regataos-store-%{version}.tar.xz
/opt/regataos-store/%{name}.desktop

%changelog
