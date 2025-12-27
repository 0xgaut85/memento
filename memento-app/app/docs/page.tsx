"use client";

import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/page-wrapper";

export default function DocsPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-mono text-black/40 tracking-widest mb-3">
            DOCUMENTATION
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
            Docs
          </h1>
          <div className="bg-black/[0.02] border border-black/5 p-8">
            <p className="text-black/50 text-lg">
              Documentation coming soon.
            </p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}

