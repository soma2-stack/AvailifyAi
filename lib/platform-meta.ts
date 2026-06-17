import type { Tier } from "./types";

export type PlatformMeta = {
  name: string;
  tier: Tier;
  initials: string;
  iconDomain: string;
  displayUrl: (username: string) => string;
};

export type DomainMeta = {
  name: string;
  extension: ".com" | ".ai" | ".io" | ".net" | ".co";
  initials: string;
};

// Kept client-safe on purpose: the server adapters import network and Node APIs.
export const PLATFORM_META: PlatformMeta[] = [
  {
    name: "GitHub",
    tier: "A",
    initials: "GH",
    iconDomain: "github.com",
    displayUrl: (username) => `github.com/${username}`,
  },
  {
    name: "Reddit",
    tier: "A",
    initials: "Rd",
    iconDomain: "reddit.com",
    displayUrl: (username) => `reddit.com/user/${username}`,
  },
  {
    name: "YouTube",
    tier: "A",
    initials: "YT",
    iconDomain: "youtube.com",
    displayUrl: (username) => `youtube.com/@${username}`,
  },
  {
    name: "TikTok",
    tier: "B",
    initials: "TT",
    iconDomain: "tiktok.com",
    displayUrl: (username) => `tiktok.com/@${username}`,
  },
  {
    name: "X",
    tier: "B",
    initials: "X",
    iconDomain: "x.com",
    displayUrl: (username) => `x.com/${username}`,
  },
  {
    name: "Instagram",
    tier: "B",
    initials: "IG",
    iconDomain: "instagram.com",
    displayUrl: (username) => `instagram.com/${username}`,
  },
  {
    name: "Threads",
    tier: "B",
    initials: "Th",
    iconDomain: "threads.net",
    displayUrl: (username) => `threads.net/@${username}`,
  },
  {
    name: "Twitch",
    tier: "B",
    initials: "TW",
    iconDomain: "twitch.tv",
    displayUrl: (username) => `twitch.tv/${username}`,
  },
  {
    name: "Facebook",
    tier: "B",
    initials: "FB",
    iconDomain: "facebook.com",
    displayUrl: (username) => `facebook.com/${username}`,
  },
  {
    name: "Snapchat",
    tier: "B",
    initials: "SC",
    iconDomain: "snapchat.com",
    displayUrl: (username) => `snapchat.com/add/${username}`,
  },
  {
    name: "Pinterest",
    tier: "B",
    initials: "PI",
    iconDomain: "pinterest.com",
    displayUrl: (username) => `pinterest.com/${username}`,
  },
  {
    name: "LinkedIn",
    tier: "B",
    initials: "IN",
    iconDomain: "linkedin.com",
    displayUrl: (username) => `linkedin.com/in/${username}`,
  },
  {
    name: "Steam",
    tier: "B",
    initials: "ST",
    iconDomain: "steampowered.com",
    displayUrl: (username) => `steamcommunity.com/id/${username}`,
  },
  {
    name: "Spotify",
    tier: "B",
    initials: "SP",
    iconDomain: "spotify.com",
    displayUrl: (username) => `open.spotify.com/user/${username}`,
  },
  {
    name: "SoundCloud",
    tier: "B",
    initials: "SC",
    iconDomain: "soundcloud.com",
    displayUrl: (username) => `soundcloud.com/${username}`,
  },
  {
    name: "Roblox",
    tier: "B",
    initials: "RB",
    iconDomain: "roblox.com",
    displayUrl: (username) => `roblox.com/users/profile?username=${username}`,
  },
  {
    name: "Telegram",
    tier: "B",
    initials: "TG",
    iconDomain: "telegram.org",
    displayUrl: (username) => `t.me/${username}`,
  },
  {
    name: "Medium",
    tier: "B",
    initials: "MD",
    iconDomain: "medium.com",
    displayUrl: (username) => `medium.com/@${username}`,
  },
  {
    name: "Substack",
    tier: "B",
    initials: "SS",
    iconDomain: "substack.com",
    displayUrl: (username) => `${username}.substack.com`,
  },
  {
    name: "GitLab",
    tier: "B",
    initials: "GL",
    iconDomain: "gitlab.com",
    displayUrl: (username) => `gitlab.com/${username}`,
  },
  {
    name: "Discord",
    tier: "B",
    initials: "DC",
    iconDomain: "discord.com",
    displayUrl: (username) => `discord.com - search ${username}`,
  },
];

export const DOMAIN_META: DomainMeta[] = [
  { name: "Domain .com", extension: ".com", initials: ".com" },
  { name: "Domain .ai", extension: ".ai", initials: ".ai" },
  { name: "Domain .io", extension: ".io", initials: ".io" },
  { name: "Domain .net", extension: ".net", initials: ".net" },
  { name: "Domain .co", extension: ".co", initials: ".co" },
];
