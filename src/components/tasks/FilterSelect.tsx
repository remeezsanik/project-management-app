import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/select";

export function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 w-full border-gray-300 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 md:w-44">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
