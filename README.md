# Rhythmly

This is a simple rhythm game website, but with a twist: **users don't have passwords, but rather play a rhythm game chart to login!**

This project is created as a part of [Hack Club's Authly YSWS](https://authly.hackclub.com)!

## How to use

First of all, if you don't play rhythm games, you're probably thinking, what's a **chart**? In rhythm games, a chart is basically a level that you play, and it involves the **timing** and **location** (if applicable) that you need to tap/click/kick/whatever to hit the note. This website's rhythm charts use your regular keys on a keyboard, so you have to tap the **right key** at the **right time** to hit a note and score a point.

With that out of the way, let's get started! First, head over to [the website](https://rhythmly.davidwhy.me) and register for an account. To register, you need a **username** and an **audio file** that will play whenever you try to log in. Then, tap any key to begin **charting**! You will tap out a rhythm as your song plays, which serves as your password - you will repeat the same pattern to log in!

To sign in to your account, you first enter your username. Then, tap any key to play your song, and you must repeat the same rhythm pattern you tapped out, with the right keys! There's a **&pm;200ms** timing window (which is actually pretty wide for a rhythm game), so don't be too far off!

The functionality after you login is that you can **create rhythm game levels**, similar to the ones you made when logging in, which you and others can play. This time though, the keys to press are **displayed to you**, so just tap to the beat and have fun :D

## Technical description

The project is split into frontend and backend. The frontend (`/src/`) is written using [Vue.js](https://vuejs.org) and [Bootstrap](https://getbootstrap.com), and it's packaged into a single `index.html` file by [Vite](https://vite.dev). The backend (`/server/`) is written in Typescript and uses the [Bun](https://bun.com) JS/TS runtime, which has built-in routing and PostgreSQL support.
