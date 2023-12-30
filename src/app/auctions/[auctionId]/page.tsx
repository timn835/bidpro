import LotsFeed from "@/components/LotsFeed";

export type PageProps = {
  params: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

const Page = (props: PageProps) => {
  return (
    <main>
      <LotsFeed {...props} />
    </main>
  );
};

export default Page;
