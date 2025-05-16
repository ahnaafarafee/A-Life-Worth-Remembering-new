import Image from "next/image";
import { GoldButton } from "./gold-button";
import SectionHeader from "./section-header";

export default function FamilyTreeSection() {
  return (
    <section className="family-tree-section max-w-7xl mx-auto px-5 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-white bg-[radial-gradient(circle_at_90%_10%,rgba(212,175,55,0.03)_0%,rgba(255,255,255,0)_50%),radial-gradient(circle_at_10%_90%,rgba(212,175,55,0.03)_0%,rgba(255,255,255,0)_50%)]"></div>

      <div className="relative z-10">
        <SectionHeader
          title="FAMILY TREE"
          subtitle="Connect with other family members and visualize your family's history across generations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-12">
          <div
            className="relative max-w-[500px] mx-auto bg-[#fffdf5] rounded-xl flex items-center justify-center"
            style={{ minHeight: 320 }}
          >
            <Image
              src="/images/family-tree.png"
              alt="Interactive Family Tree"
              width={400}
              height={320}
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gold-primary">
              Connect with Other Family Members
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our interactive family tree feature allows you to visualize your
              family history across generations. Connect memorial pages to
              create a comprehensive view of your family's legacy.
            </p>
            <div className="pt-4">
              <GoldButton href="/family-tree">View Family Tree</GoldButton>
            </div>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-br from-[#fffdf5] to-white rounded-xl shadow-gold-final border border-gold-primary/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="text-gold-primary font-semibold mb-2">
                Visualize History
              </h4>
              <p className="text-gray-600 text-sm">
                See your family's story unfold across generations with our
                intuitive tree visualization.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-gold-primary font-semibold mb-2">
                Connect Pages
              </h4>
              <p className="text-gray-600 text-sm">
                Link memorial pages to create a comprehensive family history
                network.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-gold-primary font-semibold mb-2">
                Share Stories
              </h4>
              <p className="text-gray-600 text-sm">
                Collaborate with family members to build a rich tapestry of
                memories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
