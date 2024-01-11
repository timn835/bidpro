"use client";

import { ArrowRight, Gem, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LoginLink,
  RegisterLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

type MobileNavProps = { isAuth: boolean; isSubscribed: boolean };

const MobileNav = ({ isAuth, isSubscribed }: MobileNavProps) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700 cursor-pointer"
      />

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li>
                  <RegisterLink
                    onClick={() => closeOnCurrent("/sign-up")}
                    className="flex items-center w-full font-semibold text-green-600"
                  >
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </RegisterLink>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <LoginLink
                    onClick={() => closeOnCurrent("/sign-in")}
                    className="flex items-center w-full font-semibold"
                  >
                    Sign in
                  </LoginLink>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/auctions")}
                    className="flex items-center w-full font-semibold"
                    href="/auctions"
                  >
                    Auctions
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/pricing")}
                    className="flex items-center w-full font-semibold"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  {isSubscribed ? (
                    <Link
                      onClick={() => closeOnCurrent("/dashboard/billing")}
                      className="flex items-center w-full font-semibold"
                      href="/dashboard/billing"
                    >
                      Manage Subscription
                    </Link>
                  ) : (
                    <Link
                      onClick={() => closeOnCurrent("/pricing")}
                      className="flex items-center w-full font-semibold"
                      href="/pricing"
                    >
                      Upgrade <Gem className="text-blue-600 h-4 w-4 ml-1.5" />
                    </Link>
                  )}
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/auctions")}
                    className="flex items-center w-full font-semibold"
                    href="/auctions"
                  >
                    Auctions
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/dashboard")}
                    className="flex items-center w-full font-semibold"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <LogoutLink className="flex items-center w-full font-semibold">
                    Log out
                  </LogoutLink>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
