"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

type AOSInitializerProps = {
  duration?: number;
  offset?: number;
  once?: boolean;
  easing?: string;
};

export default function AOSInitializer({
  duration = 600,
  offset = 120,
  once = true,
}: AOSInitializerProps = {}) {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({
      offset,
      duration,
      once,
    });
  }, [duration, offset, once]);

  useEffect(() => {
    AOS.refreshHard();
  }, [pathname]);

  return null;
}
