type PageProps = {
  params: {
    auctionId: string;
  };
};

const Page = ({ params }: PageProps) => {
  const { auctionId } = params;
  return <div>Page where admin can view bids for the auction: {auctionId}</div>;
};

export default Page;
