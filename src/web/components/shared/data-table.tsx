import { useState, useMemo } from "react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	ArrowUpDownIcon,
	SearchIcon,
} from "lucide-react";

interface DataTableProps<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	isPending?: boolean;
	searchKey?: string;
	total?: number;
}

export function DataTable<TData>({
	columns,
	data,
	isPending,
	searchKey,
	total,
}: DataTableProps<TData>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState("");

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			globalFilter,
		},
		initialState: {
			pagination: { pageSize: 10 },
		},
	});

	return (
		<div className="space-y-4">
			{searchKey ? (
				<div className="relative max-w-sm">
					<SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
					<Input
						placeholder="Search..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-8"
					/>
				</div>
			) : null}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : (
											<button
												type="button"
												className="flex items-center gap-1 font-medium"
												onClick={header.column.getToggleSortingHandler()}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												<ArrowUpDownIcon className="size-3 text-muted-foreground" />
											</button>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isPending ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-32 text-center text-muted-foreground"
								>
									Loading...
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-32 text-center text-muted-foreground"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{total !== undefined
						? `Total ${total}`
						: `${table.getFilteredRowModel().rows.length} row(s)`}
				</p>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronsLeftIcon className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeftIcon className="size-4" />
						</Button>
						<span className="flex items-center gap-1 px-2 text-sm tabular-nums">
							{table.getState().pagination.pageIndex + 1} /{" "}
							{table.getPageCount()}
						</span>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<ChevronRightIcon className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<ChevronsRightIcon className="size-4" />
						</Button>
					</div>
					<select
						className="h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						value={table.getState().pagination.pageSize}
						onChange={(e) => table.setPageSize(Number(e.target.value))}
					>
						{[10, 20, 30, 50].map((size) => (
							<option key={size} value={size}>
								{size} / page
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
