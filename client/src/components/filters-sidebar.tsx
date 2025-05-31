import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterOptions } from "@/types/content";

interface FiltersSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    // Convert "all" back to empty string for filtering logic
    const actualValue = value === 'all' ? '' : value;
    onFiltersChange({ ...filters, [key]: actualValue });
  };

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 h-screen sticky top-16 hidden lg:block">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        {/* Content Type */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Content Type</h4>
          <RadioGroup
            value={filters.contentType}
            onValueChange={(value) => updateFilter('contentType', value as FilterOptions['contentType'])}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-sm cursor-pointer">All Content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="documentary" id="documentary" />
              <Label htmlFor="documentary" className="text-sm cursor-pointer">Documentaries</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="music" id="music" />
              <Label htmlFor="music" className="text-sm cursor-pointer">Music</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Genre Filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Genre</h4>
          <Select value={filters.genre || 'all'} onValueChange={(value) => updateFilter('genre', value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Nature">Nature</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Crime">Crime</SelectItem>
              <SelectItem value="Biography">Biography</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Classical">Classical</SelectItem>
              <SelectItem value="Jazz">Jazz</SelectItem>
              <SelectItem value="World">World</SelectItem>
              <SelectItem value="Art">Art</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Release Year</h4>
          <Select value={filters.year || 'all'} onValueChange={(value) => updateFilter('year', value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Any Year" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectItem value="all">Any Year</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2019">2019</SelectItem>
              <SelectItem value="2018">2018</SelectItem>
              <SelectItem value="2017">2017</SelectItem>
              <SelectItem value="2016">2016</SelectItem>
              <SelectItem value="2015">2015</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating Filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Minimum Rating</h4>
          <Select value={filters.rating || 'all'} onValueChange={(value) => updateFilter('rating', value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="90">9.0+</SelectItem>
              <SelectItem value="80">8.0+</SelectItem>
              <SelectItem value="70">7.0+</SelectItem>
              <SelectItem value="60">6.0+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  );
}
