import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";
import { GoldButton } from "@/components/gold-button";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12"
      style={{
        backgroundImage: "url('/images/background-new.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        maxWidth: "100%",
      }}
    >
      <div className="container mx-auto max-w-7xl bg-white rounded-lg border-4 border-gold-primary shadow-2xl overflow-hidden">
        <Navbar />

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <SectionHeader
              title="ABOUT A LIFE WORTH REMEMBERING"
              subtitle="Creating beautiful online legacy pages to celebrate, remember, and share the stories of lives lived - past and present"
            />

            <div className="max-w-4xl mx-auto mb-16">
              <div className="mb-10 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/about-us-picture.jpg"
                  alt="Memorial collage of Breannon"
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                />
              </div>

              {/* <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Welcome to A Life Worth Remembering—a place not of loss, but
                  of love. A space created not just to mourn those who have
                  passed but to celebrate the moments, the laughter, the
                  connections, and the stories that make every life so
                  meaningful.
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  This journey began with my daughter, Breannon. When she
                  unexpectedly passed away in August 2023, I searched for a way
                  to honour her—not just with a memorial, but with a beautiful
                  tribute to who she was, the people she loved, and the memories
                  we shared. I wanted a place where her story could live on,
                  woven together by the voices of family and friends, ensuring
                  she would always be remembered for the life she lived, not
                  just the fact that she was gone.
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  When I couldn't find a platform that truly reflected this
                  vision, I created A Life Worth Remembering. What started as a
                  tribute to Breannon soon became something more. I realised
                  that every life deserves to be remembered in this way—not just
                  in fragments, but as a complete and connected story.
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  This site is about capturing the essence of a person—who they
                  were, the relationships they cherished, and the moments that
                  made their life extraordinary. It's a sacred space where
                  families and friends can come together to share stories,
                  photos, and memories, ensuring that the bonds we build in life
                  continue long after we're gone.
                </p>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  But A Life Worth Remembering isn't only for those who have
                  passed. It's also a place for everyone to document their own
                  story—a way to preserve the details of their life, share
                  experiences, and leave behind a legacy in their own words.
                  Whether you're honouring a loved one or creating your own
                  legacy page, this platform offers a meaningful way to
                  celebrate life in all its beauty.
                </p>

                <p className="text-gray-700 font-medium text-lg">
                  Because every life deserves to be remembered. And not just for
                  how it ended—but for how it was lived.
                </p>
              </div> */}

              <div className="space-y-4 text-base text-gray-800 leading-relaxed">
                <p>
                  <span className="font-bold">
                    Welcome to A Life Worth Remembering
                  </span>
                  —a place not of loss,{" "}
                  <span className="font-bold">but of love</span>.
                </p>

                <p>
                  Whether you're honouring a loved one or creating your own
                  legacy,{" "}
                  <span className="italic">A Life Worth Remembering</span>{" "}
                  offers a meaningful way to gather memories, photos, and
                  reflections in one place. It’s a space to capture the essence
                  of a <span className="text-red-600">life</span> — through the
                  voices of friends, family, and your own.
                </p>

                <p>
                  This is a deeply personal project, created from the heart
                  after the loss of my daughter, Breannon. When Breannon
                  unexpectedly passed away in August 2023, I searched for a way
                  to honour her, not just with a memorial,{" "}
                  <span className="underline">but with</span> a beautiful
                  tribute to who she was, the people she loved, and the memories
                  we shared.
                </p>

                <p>
                  I wanted a place where her story could live on, woven together
                  by the voices of those who knew her best{" "}
                  <span className="underline">ensuring</span> she would always
                  be remembered for the{" "}
                  <span className="underline">
                    life she lived, not just the fact
                  </span>{" "}
                  that she was gone.
                </p>

                <p>
                  When I couldn’t find a platform that truly reflected this
                  vision,{" "}
                  <span className="italic">
                    I created A Life Worth Remembering
                  </span>
                  .
                </p>

                <p>
                  What began as a tribute to Breannon soon became something
                  more. I realised that{" "}
                  <span className="font-semibold">
                    every life deserves to be remembered in this way
                  </span>
                  —not just in fragments, but as a complete and connected story.
                </p>

                <p>
                  <span className="italic">A Life Worth Remembering</span> is
                  about capturing the essence of a person—who they were, the
                  relationships they cherished, and the moments that made their
                  life extraordinary. It’s a sacred space where families and
                  friends can come together to share stories, photos, and
                  memories, ensuring the bonds we build in life continue long
                  after we’re gone.
                </p>

                <p>
                  <span className="italic">A Life Worth Remembering</span> isn’t
                  only for those who have passed. It’s also a place to begin
                  documenting your own story—a way to preserve the details of
                  your life, share your experiences, and leave behind a legacy
                  in your own words.
                </p>

                <p>
                  Whether you’re commemorating a loved one or creating your{" "}
                  <span className="underline">own</span> legacy page, this
                  platform offers a powerful and personal way to celebrate life
                  in all its beauty.
                </p>

                <p className="font-bold">
                  Because every life deserves to be remembered,
                  <br />
                  not just for how it ended, but for how it was lived.
                </p>

                <p className="font-semibold">A Life Worth Remembering</p>
                <p className="italic text-sm text-gray-700">
                  Honour the life. Celebrate the journey. Remember the story.
                </p>
              </div>
            </div>

            <div className="text-center">
              <GoldButton href="/pricing">Create A Memorial</GoldButton>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
