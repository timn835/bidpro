import { cn } from "@/lib/utils";
import Link from "next/link";

type PaginationProps = {
  page?: string;
  totalPages: number;
  hasNextPage: boolean;
};
const Pagination = ({
  page = "1",
  totalPages,
  hasNextPage,
}: PaginationProps) => {
  const currentPage = Math.min(Math.max(Number(page), 1), totalPages);
  const getPagesToShow = () => {
    let startPage = currentPage - 2;
    let endPage = currentPage + 2;

    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
      endPage = totalPages;
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const pages = getPagesToShow();
  return (
    <div className="flex items-center justify-center space-x-6 text-black">
      <Link
        className={cn(
          "rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50",
          currentPage === 1 ? "pointer-events-none bg-gray-100" : ""
        )}
        href={`?page=${currentPage - 1}`}
      >
        Previous
      </Link>
      {currentPage - 2 > 1 ? (
        <>
          <Link
            className="relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-md "
            href="?page=1"
          >
            1
          </Link>
          <div>...</div>
        </>
      ) : null}

      <nav
        aria-label="Pagination"
        className="relative z-0 inline-flex -space-x-px rounded-md"
      >
        {pages.map((p, i) => (
          <Link
            key={p}
            className={cn(
              "relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50",
              p === currentPage ? "pointer-events-none bg-gray-100" : "",
              i === 0 ? "rounded-l-md" : "",
              i === pages.length - 1 ? "rounded-r-md" : ""
            )}
            href={`?page=${p}`}
          >
            {p}
          </Link>
        ))}
      </nav>

      {totalPages - currentPage > 2 ? (
        <>
          <div>...</div>
          <Link
            className="relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 rounded-md "
            href={`?page=${totalPages}`}
          >
            {totalPages}
          </Link>
        </>
      ) : null}

      <Link
        className={cn(
          "rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50",
          !hasNextPage ? "pointer-events-none bg-gray-100" : ""
        )}
        href={`?page=${currentPage + 1}`}
      >
        Next
      </Link>
    </div>
  );
};

export default Pagination;
