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
  
  // Add level field - ensure it's lowercase to match server-side enum
  // If courseLevel exists in data use it, otherwise use "beginner" as default
  const level = data.courseLevel ? data.courseLevel.toLowerCase() : "beginner";
  formData.append("level", level);

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
    console.log("No sections to process for video uploads");
    return [];
  }

  // Create a deep copy to avoid mutating the original objects
  const updatedSections = JSON.parse(JSON.stringify(localSections));

  console.log(`Starting video upload process for ${updatedSections.length} sections in course ${courseId}`);

  // Process sections sequentially to avoid overwhelming the server
  for (let i = 0; i < updatedSections.length; i++) {
    const section = updatedSections[i];
    console.log(`Processing section ${i+1}/${updatedSections.length}: ${section.sectionTitle}`);
    
    if (!section.chapters || !Array.isArray(section.chapters) || section.chapters.length === 0) {
      console.log(`No chapters to process in section ${section.sectionTitle}`);
      continue;
    }

    // Process chapters sequentially to avoid race conditions
    for (let j = 0; j < section.chapters.length; j++) {
      const chapter = section.chapters[j];
      if (!chapter) continue;
      
      console.log(`Processing chapter ${j+1}/${section.chapters.length}: ${chapter.title}`);
      
      // Check if this chapter has a video that needs uploading
            const originalChapter = localSections[i]?.chapters[j];
      const hasFileToUpload = originalChapter?.video instanceof File;
      
      if (!hasFileToUpload) {
        console.log(`No video file to upload for chapter: ${chapter.title}`);
              continue;
            }

      try {
        const videoFile = originalChapter.video as File;
        console.log(`Found video file to upload: ${videoFile.name} (${videoFile.size} bytes)`);
        
        // Request a presigned URL from the server
        console.log(`Requesting upload URL for: courseId=${courseId}, sectionId=${section.sectionId}, chapterId=${chapter.chapterId}`);
            
            const response = await getUploadVideoUrl({
              courseId,
          sectionId: section.sectionId,
              chapterId: chapter.chapterId,
          fileName: videoFile.name,
          fileType: videoFile.type,
            }).unwrap();
            
        // Improved response validation
        if (!response) {
          throw new Error("Empty response from server when requesting upload URL");
        }
        
        // Extract data from response, handling both direct and nested formats
        const responseData = response.data || response;
        
        // Extract required fields with better error handling
        const uploadUrl = responseData.uploadUrl;
        const videoUrl = responseData.videoUrl;
        const isMock = responseData.isMock || false;
            
            if (!uploadUrl || !videoUrl) {
          console.error("Invalid response structure:", responseData);
          throw new Error("Missing upload URL or video URL in server response");
        }
        
        // If it's a mock URL (local environment without AWS S3)
        if (isMock) {
          console.log(`Using mock video URL in development mode: ${videoUrl}`);
          // No need for actual upload, just save the mock URL
          updatedSections[i].chapters[j].video = videoUrl;
          toast.success(`Video processed successfully for ${chapter.title} (development mode)`);
          continue;
        }
        
        console.log(`Got presigned URL. Uploading video file to S3...`);
        
        // Upload the file to S3 using the presigned URL
        try {
          const uploadResponse = await fetch(uploadUrl, {
              method: "PUT",
              headers: {
              "Content-Type": videoFile.type,
              },
            body: videoFile,
            });
            
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload to S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }
          
          console.log(`Video uploaded successfully. Final URL: ${videoUrl}`);
            
          // Update the chapter with the video URL
            updatedSections[i].chapters[j].video = videoUrl;
          toast.success(`Video uploaded successfully for ${chapter.title}`);
        } catch (uploadError) {
          console.error(`S3 upload error for ${chapter.title}:`, uploadError);
          toast.error(`Failed to upload video to storage service: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          // Still keep the URL to try again later
          updatedSections[i].chapters[j].video = videoUrl;
        }
      } catch (error) {
        console.error(`Error uploading video for chapter ${chapter.title}:`, error);
        // Keep the video as empty string to avoid type errors
        updatedSections[i].chapters[j].video = "";
        toast.error(`Failed to upload video for ${chapter.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  console.log("Video upload process completed");
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

// Define the CourseFormData interface if it doesn't exist
export interface CourseFormData {
  courseTitle: string;
  courseDescription: string;
  courseCategory: string;
  coursePrice: string;
  courseStatus: boolean;
  courseLevel: string;
}

/**
 * Generate mock data for analytics dashboard charts
 * Use this function when API data is not available or incomplete
 */
export const generateMockAnalyticsData = () => {
  // Mock data for course enrollment by category
  const mockEnrollmentByCategory = [
    { name: "Programming", value: 45 },
    { name: "Design", value: 30 },
    { name: "Business", value: 25 },
    { name: "Marketing", value: 20 },
    { name: "Music", value: 15 },
    { name: "Photography", value: 10 },
  ];

  // Mock data for revenue by month
  const mockRevenueByMonth = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      revenue: Math.floor(Math.random() * 50000) + 10000
    };
  });

  // Mock data for user growth
  const mockUserGrowth = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      students: Math.floor(Math.random() * 10) + (i + 1) * 5,
      teachers: Math.floor(Math.random() * 3) + Math.max(1, Math.floor(i / 2))
    };
  });

  // Mock data for course creation trend
  const mockCourseCreationTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      date: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      courses: Math.floor(Math.random() * 5) + Math.max(1, Math.floor(i / 2))
    };
  });

  // Mock data for completion rates
  const mockCompletionRates = [
    { category: "Programming", rate: 75 },
    { category: "Design", rate: 82 },
    { category: "Business", rate: 65 },
    { category: "Marketing", rate: 70 },
    { category: "Music", rate: 88 },
    { category: "Photography", rate: 79 },
  ];

  // Mock data for daily active users
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mockDailyActiveUsers = daysOfWeek.map(day => ({
    day,
    users: Math.floor(Math.random() * 100) + 80
  }));

  // Mock data for user types
  const mockUserTypes = [
    { name: "Students", value: 68 },
    { name: "Teachers", value: 24 },
    { name: "Admins", value: 8 }
  ];

  // Mock data for revenue by category
  const mockRevenueByCategory = [
    { category: "Computer Science", value: 45000000 },
    { category: "Artificial Intelligence", value: 32000000 },
    { category: "Web Development", value: 28000000 },
    { category: "Data Science", value: 24000000 },
    { category: "Mobile Development", value: 18000000 },
    { category: "Science", value: 12000000 }
  ];

  // Mock data for revenue forecast
  const mockRevenueForecast = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return {
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      forecasted: Math.floor(Math.random() * 60000) + 20000 + (i * 5000),
      actual: i < 3 ? Math.floor(Math.random() * 50000) + 15000 : null
    };
  });

  // Mock data for registration trend
  const mockRegistrationTrend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * 5);
    const randomSpike = i === 8 ? 3 : 0; // Add a spike at a specific point
    return {
      date: date.toISOString().split('T')[0],
      registrations: Math.floor(Math.random() * 2) + randomSpike
    };
  });

  return {
    enrollmentByCategory: mockEnrollmentByCategory,
    revenueByMonth: mockRevenueByMonth,
    userGrowth: mockUserGrowth,
    courseCreationTrend: mockCourseCreationTrend,
    completionRates: mockCompletionRates,
    dailyActiveUsers: mockDailyActiveUsers,
    userTypes: mockUserTypes,
    revenueByCategory: mockRevenueByCategory,
    revenueForecast: mockRevenueForecast,
    registrationTrend: mockRegistrationTrend
  };
};
