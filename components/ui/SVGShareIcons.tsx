import {
  RiFacebookFill,
  RiMessengerLine,
  RiWhatsappLine,
  RiTwitterLine,
  RiFileCopyLine,
} from "react-icons/ri";

export const SVGShareIcons = ({
  type,
  width,
  height,
}: {
  type: string;
  width: string;
  height: string;
}) => {
  switch (type) {
    case "facebook":
      return (
        <RiFacebookFill
          style={{
            fill: "#000",
            width,
            height,
          }}
        />
      );

    case "twitter":
      return (
        <RiTwitterLine
          style={{
            fill: "#000",
            width,
            height,
          }}
        />
      );

    case "whatsapp":
      return (
        <RiWhatsappLine
          style={{
            fill: "#000",
            width,
            height,
          }}
        />
      );

    case "fbmessenger":
      return (
        <RiMessengerLine
          style={{
            fill: "#000",
            width,
            height,
          }}
        />
      );

    case "copy":
      return (
        <RiFileCopyLine
          style={{
            fill: "#000",
            width,
            height,
          }}
        />
      );
  }
  return <></>
};
