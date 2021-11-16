import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const FormNavigationBlock = ({
  shouldBlock,
}: {
  shouldBlock: boolean;
}) => {
  const { t } = useTranslation();
  const message = t(
    "form.unsavedchanges",
    "It looks like you've unsaved changes. Leave without saving?"
  );
  const router = useRouter();

  useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!shouldBlock) return;
      e.preventDefault();
      return (e.returnValue = message);
    };
    const handleBrowseAway = () => {
      if (!shouldBlock) return;
      if (window.confirm(message)) return;
      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };
    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [shouldBlock, router.events, message]);

  return <></>;
};
