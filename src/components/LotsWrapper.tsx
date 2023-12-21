import CreateLotButton from "./CreateLotButton";

const LotsWrapper = () => {
  return (
    <div>
      <div className="w-full flex flex-wrap justify-between p-4 gap-x-4">
        <h1 className="font-bold text-xl">Lots registered</h1>
        <CreateLotButton />
      </div>
      <div>List of lots</div>
    </div>
  );
};

export default LotsWrapper;
