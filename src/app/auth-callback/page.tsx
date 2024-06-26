"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { trpc } from "../_trpc/client";
import { Suspense } from "react";

const AuthCallbackComponent = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const origin = searchParams.get("origin");

	// this query runs on page load
	trpc.authCallback.useQuery(undefined, {
		onSuccess: ({ success }) => {
			if (success) {
				// user is synced to database
				router.push(origin ? `/${origin}` : "dashboard");
			}
		},
		onError: (err) => {
			if (err.data?.code === "UNAUTHORIZED") {
				router.push("/api/auth/login");
			}
		},
		retry: true,
		retryDelay: 2000,
	});
	return (
		<div className="w-full mt-24 flex justify-center">
			<div className="flex flex-col items-center gap-2">
				<Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
				<h3 className="font-semibold text-xl">Setting up your account ...</h3>
				<p>You will be redirected automatically.</p>
			</div>
		</div>
	);
};

const Page = () => {
	return (
		<Suspense>
			<AuthCallbackComponent />
		</Suspense>
	);
};

export default Page;
