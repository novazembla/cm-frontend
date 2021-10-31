import { useRef, useEffect, useState } from "react";
import { chakra, Box } from "@chakra-ui/react";
import { debounce } from "lodash";

export const TrimmedTextWithBottomEdge = ({
  text,
  numLines = 3,
  edgeWidth = 60,
}: {
  text: string;
  numLines?: number;
  edgeWidth?: number;
}) => {
  const span = useRef<HTMLDivElement>(null);
  const [out, setOut] = useState(text);
  const [eventListenerAdded, setEventListenerAdded] = useState(false);

  const onResize = debounce(() => {

    if (!span.current) return;
    span.current.innerText = text;

    const rects = span.current.getClientRects();
    console.log(
      rects.length,
      span.current.offsetWidth - edgeWidth,
      "rrr",
      numLines,
      edgeWidth
    );
    if (rects.length < numLines - 1) return;
    console.log("d");
    let shortEnough = false;
    let newOut = span.current.innerText;

    while (!shortEnough) {
      console.log("in");
      span.current.innerText = span.current.innerText.slice(
        0,
        span.current.innerText.length - 1
      );
      const test = span.current.getClientRects();
      if (
        test.length == numLines &&
        test[test.length - 1].width < span.current.offsetWidth - edgeWidth
      ) {
        console.log("setting trimmed text", test, test[test.length - 1].width);
        shortEnough = true;
        newOut = span.current.innerText;
      }
    }
    setOut(newOut);
  }, 350);

  useEffect(() => {
    if (typeof window === "undefined" || eventListenerAdded) return;

    setEventListenerAdded(true);

    window.addEventListener("resize", onResize);
    onResize();
    document.addEventListener("DOMContentLoaded", onResize);

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <chakra.span hyphens="auto" ref={span}>
        {out}
      </chakra.span>
      {out !== text && <chakra.span>&hellip;</chakra.span>}
    </Box>
  );
};
