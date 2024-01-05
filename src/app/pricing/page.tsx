import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import UpgradeButton from "@/components/UpgradeButton";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLANS } from "@/config/stripe";
import { cn } from "@/lib/utils";
import {
  LoginLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const pricingItems = [
    {
      plan: "Free",
      tagline: "For placing bids on your favorite items.",
      features: [
        {
          text: "View available lots for any auction",
          footnote:
            "Allows you to see images, minimal bid and popularity of each lot.",
        },
        {
          text: "Place bids on all available items",
          footnote: "Your bid must be at greater than the minimal bid allowed.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "View bid history",
          footnote:
            "See which bids you have previously placed and which ones were successful.",
        },
      ],
    },
    {
      plan: "Admin",
      tagline: "For auctioneers holding their own auctions",
      features: [
        {
          text: "Create your own auctions",
          footnote: "Create up to 5 active auctions at a time.",
        },
        {
          text: "Upload auction image",
          footnote: "Attach a personalized image for each auction.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: "Create lots for each auction",
          footnote: "Create up to 100 lots for each auction.",
        },
        {
          text: "Upload high-quality images for each lot",
          footnote: "Upload up to 5 images to display your items.",
        },
      ],
    },
  ];

  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Place online bids on your favorite items for free! Create your own
            auctions for as low as $15 a month!
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, features }) => {
              const price =
                PLANS.find((p) => p.slug === plan.toLowerCase())?.price
                  .amount || 0;

              return (
                <div
                  key={plan}
                  className={cn("relative rounded-2xl bg-white shadow-lg", {
                    "border-2 border-blue-600 shadow-blue-200":
                      plan === "Admin",
                    "border border-gray-200": plan !== "Admin",
                  })}
                >
                  {plan === "Pro" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                      Upgrade now
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="my-3 text-center font-display text-3xl font-bold">
                      {plan}
                    </h3>
                    <p className="text-gray-500">{tagline}</p>
                    <p className="my-5 font-display text-6xl font-semibold">
                      ${price}
                    </p>
                    <p className="text-gray-500">per month</p>
                  </div>

                  <ul className="my-10 space-y-5 px-8">
                    {features.map(({ text, footnote }) => (
                      <li key={text} className="flex space-x-5">
                        <div className="flex-shrink-0">
                          <Check className="h-6 w-6 text-blue-500" />
                        </div>
                        {footnote ? (
                          <div className="flex items-center space-x-1">
                            <p className="text-gray-600">{text}</p>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="cursor-default ml-1.5">
                                <HelpCircle className="h-4 w-4 text-zinc-500" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">
                                {footnote}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <p className="text-gray-600">{text}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200" />
                  <div className="p-5">
                    {plan === "Free" ? (
                      user ? (
                        <Link
                          href="/dashboard"
                          className={buttonVariants({
                            className: "w-full",
                            variant: "secondary",
                          })}
                        >
                          Upgrade now
                          <ArrowRight className="h-5 w-5 ml-1.5" />
                        </Link>
                      ) : (
                        <LoginLink
                          className={buttonVariants({
                            className: "w-full",
                            variant: "secondary",
                          })}
                        >
                          Sign Up
                          <ArrowRight className="h-5 w-5 ml-1.5" />
                        </LoginLink>
                      )
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <LoginLink
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        Sign Up
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </LoginLink>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default Page;
