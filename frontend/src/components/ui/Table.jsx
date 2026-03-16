import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import clsx from 'clsx';

// columns: { header: string, accessor: string | function, cell?: function }[]
export const ResponsiveTable = ({ 
  columns, 
  data, 
  keyField = 'id',
  isLoading = false,
  emptyMessage = "No records found",
  onRowClick,
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View: Cards */}
      <div className="block md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div 
            key={row[keyField] || rowIndex} 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((col, colIndex) => {
              const value = typeof col.accessor === 'function' 
                  ? col.accessor(row) 
                  : row[col.accessor];

              // Skip rendering empty values/nulls if desired, or render placeholder
              if (col.hideOnMobile) return null;

              return (
                <div key={colIndex} className="flex justify-between py-2 border-b last:border-0 border-gray-100">
                  <span className="font-medium text-gray-500 text-sm">{col.header}</span>
                  <span className="text-gray-900 text-sm text-right">
                    {col.cell ? col.cell(row) : value}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={row[keyField] || rowIndex} 
                className={onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, colIndex) => {
                  const value = typeof col.accessor === 'function' 
                    ? col.accessor(row) 
                    : row[col.accessor];
                  
                  return (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.cell ? col.cell(row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 bg-white border-t border-gray-200 mt-4 rounded-b-lg">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="text-sm font-medium text-gray-700 self-center">
             {currentPage} / {totalPages}
        </span>
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* Simple pagination logic for now */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = currentPage;
                // Center the active page if possible
                if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                } else {
                    pageNum = i + 1;
                }
                
                return (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                        className={clsx(
                            currentPage === pageNum 
                                ? "relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        )}
                    >
                        {pageNum}
                    </button>
                );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
