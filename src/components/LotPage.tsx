"use client";

type LotPageProps = {
  lotId: string;
  lotOwnerId?: string;
};

const LotPage = ({ lotId, lotOwnerId }: LotPageProps) => {
  return (
    <div>
      <div>LotPage presentation for lot : {lotId}</div>
      {lotOwnerId && <div>Admin options (update-update images-delete)</div>}
    </div>
  );
};

export default LotPage;
