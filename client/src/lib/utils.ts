import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";
import { api } from "../state/api";
import { toast } from "sonner";
import { format, formatDistance } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price from cents to dollars with dollar sign
 * @param price - Price in cents
 * @returns Formatted price string with dollar sign
 */
export function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) return "Free";
  return `$${(price / 100).toFixed(2)}`;
}

/**
 * Format a date as a relative time string (e.g., "2 days ago")
 * @param date - Date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format a date in a readable format (e.g., "Jan 01, 2023 14:30")
 * @param date - Date to format
 * @param formatString - Optional format string
 * @returns Formatted date string
 */
export function formatDateTime(
  date: Date | string | number,
  formatString: string = "MMM dd, yyyy HH:mm"
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, formatString);
}

/**
 * Format a date in a short format (e.g., "Jan 01, 2023")
 * @param date - Date to format 
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  formatString: string = "MMM dd, yyyy"
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, formatString);
}

/**
 * Truncate a string to a specific length and add ellipsis if needed
 * @param str - String to truncate
 * @param length - Max length
 * @returns Truncated string
 */
export function truncateString(str: string, length: number = 50): string {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

// Convert dollars to cents (e.g., "49.99" -> 4999)
export function dollarsToCents(dollars: string | number): number {
  const amount = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
}

// Convert cents to dollars (e.g., 4999 -> "49.99")
export function centsToDollars(cents: number | undefined): string {
  return ((cents || 0) / 100).toString();
}

// Zod schema for price input (converts dollar input to cents)
export const priceSchema = z.string().transform((val) => {
  const dollars = parseFloat(val);
  if (isNaN(dollars)) return "0";
  return dollarsToCents(dollars).toString();
});

export const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor (Timor-Leste)",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar (formerly Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export const customStyles = "text-gray-300 placeholder:text-gray-500";

export function convertToSubCurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}

export const NAVBAR_HEIGHT = 48;

export const courseCategories = [
  { value: "technology", label: "Technology" },
  { value: "science", label: "Science" },
  { value: "mathematics", label: "Mathematics" },
  { value: "artificial-intelligence", label: "Artificial Intelligence" },
] as const;

export const customDataGridStyles = {
  border: "none",
  backgroundColor: "#17181D",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#1B1C22",
    color: "#6e6e6e",
    "& [role='row'] > *": {
      backgroundColor: "#1B1C22 !important",
      border: "none !important",
    },
  },
  "& .MuiDataGrid-cell": {
    color: "#6e6e6e",
    border: "none !important",
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#17181D",
    "&:hover": {
      backgroundColor: "#25262F",
    },
  },
  "& .MuiDataGrid-footerContainer": {
    backgroundColor: "#17181D",
    color: "#6e6e6e",
    border: "none !important",
  },
  "& .MuiDataGrid-filler": {
    border: "none !important",
    backgroundColor: "#17181D !important",
    borderTop: "none !important",
    "& div": {
      borderTop: "none !important",
    },
  },
  "& .MuiTablePagination-root": {
    color: "#6e6e6e",
  },
  "& .MuiTablePagination-actions .MuiIconButton-root": {
    color: "#6e6e6e",
  },
};

export const createCourseFormData = (
  data: CourseFormData,
  sections: Section[]
): FormData => {
  const formData = new FormData();
  formData.append("title", data.courseTitle.trim() || "Untitled Course");
  formData.append("description", data.courseDescription.trim());
  formData.append("category", data.courseCategory || "Uncategorized");
  formData.append("price", data.coursePrice.toString());
  formData.append("status", data.courseStatus ? "Published" : "Draft");

  // Ensure sections with videos are properly formatted for JSON
  const sectionsForAPI = sections.map((section) => {
    // Ensure section has title and description
    const sanitizedSection = {
      ...section,
      sectionId: section.sectionId,
      sectionTitle: section.sectionTitle?.trim() || "Untitled Section",
      sectionDescription: section.sectionDescription?.trim() || "",
      chapters: section.chapters?.map((chapter) => {
        // Convert video to a URL string if it exists
        let videoValue = "";
        
        if (typeof chapter.video === 'string') {
          videoValue = chapter.video.trim();
        } else if (chapter.video && typeof chapter.video === 'object') {
          if ('url' in chapter.video && chapter.video.url) {
            videoValue = chapter.video.url?.toString().trim();
          }
        }
        
        // Return sanitized chapter data
        return {
          chapterId: chapter.chapterId,
          title: chapter.title?.trim() || "Untitled Chapter",
          content: chapter.content?.trim() || "",
          type: videoValue ? "Video" : "Text",
          video: videoValue,
        };
      }) || [],
    };
    
    // Log sanitized section for debugging
    console.log("Sanitized section for API:", sanitizedSection);
    return sanitizedSection;
  });

  formData.append("sections", JSON.stringify(sectionsForAPI));

  return formData;
};

export const uploadAllVideos = async (
  localSections: Section[],
  courseId: string,
  getUploadVideoUrl: any
) => {
  if (!Array.isArray(localSections) || localSections.length === 0) {
    return [];
  }

  // Create a deep copy to avoid mutating the original objects
  const updatedSections = JSON.parse(JSON.stringify(localSections));

  // Detect File objects after JSON.stringify/parse by checking for specific properties
  const isFileObject = (obj: any): boolean => 
    obj && 
    typeof obj === 'object' && 
    'name' in obj && 
    'type' in obj && 
    'size' in obj &&
    typeof obj.type === 'string' && 
    obj.type.startsWith('video/');

  // Before processing, log what we've received
  console.log("Sections before video processing:", updatedSections);

  for (let i = 0; i < updatedSections.length; i++) {
    if (!updatedSections[i].chapters || !Array.isArray(updatedSections[i].chapters)) {
      updatedSections[i].chapters = [];
      continue;
    }

    for (let j = 0; j < updatedSections[i].chapters.length; j++) {
      const chapter = updatedSections[i].chapters[j];
      if (!chapter) continue;
      
      try {
        // Check if we have a valid video object to process
        if (isFileObject(chapter.video)) {
          console.log(`Found video file in chapter ${chapter.chapterId || j}:`, chapter.video);
          
          try {
            // Extract file information before it's lost in serialization
            const fileInfo = {
              name: chapter.video.name,
              type: chapter.video.type,
              size: chapter.video.size
            };
            
            // We need to access the actual File object from the original sections
            const originalChapter = localSections[i]?.chapters[j];
            if (!originalChapter || !(originalChapter.video instanceof File)) {
              console.warn(`No matching File object found for chapter ${chapter.chapterId || j}`);
              updatedSections[i].chapters[j].video = "";
              continue;
            }

            console.log(`Uploading video for chapter ${chapter.chapterId || j}`);
            
            // Get presigned URL
            const response = await getUploadVideoUrl({
              courseId,
              sectionId: updatedSections[i].sectionId,
              chapterId: chapter.chapterId,
              fileName: fileInfo.name,
              fileType: fileInfo.type,
            }).unwrap();
            
            // Extract URLs from response with proper error handling
            const uploadUrl = response?.data?.uploadUrl;
            const videoUrl = response?.data?.videoUrl;
            
            if (!uploadUrl || !videoUrl) {
              console.error(`Invalid upload URL response for chapter ${chapter.chapterId || j}:`, response);
              throw new Error("Invalid upload URL response");
            }

            // Upload the actual file
            await fetch(uploadUrl, {
              method: "PUT",
              headers: {
                "Content-Type": fileInfo.type,
              },
              body: originalChapter.video,
            });
            
            console.log(`Upload successful for chapter ${chapter.chapterId || j}, URL:`, videoUrl);
            toast.success(`Video uploaded successfully for ${chapter.title || `Chapter ${j+1}`}`);
            
            // Set the video URL as a string in our updated section
            updatedSections[i].chapters[j].video = videoUrl;
          } catch (error) {
            console.error(`Failed to upload video for chapter ${chapter.chapterId || j}:`, error);
            // Set a placeholder URL to avoid type mismatch
            updatedSections[i].chapters[j].video = "";
            toast.error(`Failed to upload video for ${chapter.title || `Chapter ${j+1}`}`);
          }
        } else if (typeof chapter.video === 'string' && chapter.video) {
          // Keep existing video URL
          console.log(`Keeping existing video URL for chapter ${chapter.chapterId || j}:`, chapter.video);
        } else if (typeof chapter.video === 'object' && chapter.video !== null) {
          // Handle case where video is an object but not a proper File
          console.warn(`Non-file object detected for chapter ${chapter.chapterId || j}:`, chapter.video);
          // Convert to a string URL if possible or empty string
          if ('url' in chapter.video && typeof chapter.video.url === 'string') {
            updatedSections[i].chapters[j].video = chapter.video.url;
          } else {
            updatedSections[i].chapters[j].video = "";
          }
        } else if (typeof chapter.video !== 'string') {
          // Ensure all non-string videos are converted to empty strings
          console.warn(`Invalid video value for chapter ${chapter.chapterId || j}:`, chapter.video);
          updatedSections[i].chapters[j].video = "";
        }
      } catch (chapterError) {
        console.error(`Error processing chapter ${j} in section ${i}:`, chapterError);
        updatedSections[i].chapters[j].video = "";
      }
    }
  }

  console.log("Sections after video processing:", updatedSections);
  return updatedSections;
};

async function uploadVideo(
  chapter: Chapter,
  courseId: string,
  sectionId: string,
  getUploadVideoUrl: any
): Promise<string> {
  // Safety check for File instance
  if (!chapter.video || typeof chapter.video === 'string') {
    return chapter.video as string || "";
  }
  
  // Ensure we have a File object
  let file: File;
  try {
    file = chapter.video as File;
    
    // Validate that it's actually a File with expected properties
    if (!(file instanceof File) || !file.name || !file.type) {
      console.warn(`Invalid file object for chapter ${chapter.chapterId}`);
      return "";
    }
  } catch (error) {
    console.error(`Error processing file for chapter ${chapter.chapterId}:`, error);
    return "";
  }

  try {
    // Call the API to get the upload URL
    const response = await getUploadVideoUrl({
      courseId,
      sectionId,
      chapterId: chapter.chapterId,
      fileName: file.name,
      fileType: file.type,
    }).unwrap();
    
    // Extract URLs from response with proper error handling
    const uploadUrl = response?.data?.uploadUrl;
    const videoUrl = response?.data?.videoUrl;
    
    if (!uploadUrl || !videoUrl) {
      console.error(`Invalid response format for chapter ${chapter.chapterId}:`, response);
      throw new Error("Invalid upload URL response");
    }

    // Upload the file using the presigned URL
    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    
    toast.success(`Video uploaded successfully for chapter ${chapter.title || chapter.chapterId}`);

    // Return just the URL string
    return videoUrl;
  } catch (error) {
    console.error(`Failed to upload video for chapter ${chapter.chapterId}:`, error);
    throw error;
  }
}

/**
 * Uploads an assignment file to S3 using a presigned URL
 */
export const uploadAssignmentFile = async (
  file: File,
  getUploadFileUrl: any
) => {
  try {
    // Get the presigned URL
    const { data } = await getUploadFileUrl({
      fileName: file.name,
      fileType: file.type,
    }).unwrap();

    // Use the presigned URL to upload the file directly to S3
    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    // Return the file URL
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      url: data.fileUrl,
    };
  } catch (error) {
    console.error(`Failed to upload file ${file.name}:`, error);
    throw error;
  }
};
