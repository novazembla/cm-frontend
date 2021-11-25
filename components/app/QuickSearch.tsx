import { useBreakpointValue, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

import { useQuickSearchContext } from "~/provider";

const QuickSearchForm = dynamic(() => import("./QuickSearchForm"));

export const QuickSearch = () => {
  const { isQuickSearchOpen } = useQuickSearchContext();

  const contentLeft = useBreakpointValue({
    base: 0,
    xl: "50px",
    "2xl": "calc(8vw - 55px)",
  });

  const contentWidth = useBreakpointValue({
    base: "100vw",
    md: "calc(80vw)",
    lg: "66.66vw",
    xl: "675px",
    "2xl": "695px",
  });

  return (
    <Box id="search">
      <AnimatePresence>
        {isQuickSearchOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              height: "calc(var(--vh) * 100)",
              width: contentWidth,
              left: contentLeft,
              zIndex: 1100,
            }}
            key="search-open"
          >
            <QuickSearchForm />
          </motion.div>
        ) : (
          <Box key="search-closed"></Box>
        )}
      </AnimatePresence>
    </Box>
  );
};
