import type { Metadata } from "next";
import { Faster_One, Concert_One, Contrail_One } from "next/font/google"; 
import "./globals.css";

const fasterOne = Faster_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-faster-one",
});

const concertOne = Concert_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-concert-one",
});

const contrailOne = Contrail_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-contrail-one",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

<html lang="en" className={`${fasterOne.variable} ${concertOne.variable} ${contrailOne.variable}`}>
      <body>{children}</body>
    </html>
  );
}