"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiArrowLeft,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiHeart,
  FiInfo,
  FiLock,
  FiMapPin,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
  FiUpload,
  FiStar,
  FiX,
} from "react-icons/fi";

import styles from "./edit-profile.module.scss";

type FormState = {
  profileFor: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  state: string;
  city: string;
  religion: string;
  cast: string;
  motherTongue: string;
  maritalStatus: string;
  education: string;
  college: string;
  profession: string;
  company: string;
  income: string;
  aboutYourself: string;
  diet: string;
  smoking: string;
  drinking: string;
  partnerAgeMin: string;
  partnerAgeMax: string;
  partnerState: string;
  partnerCity: string;
  partnerReligion: string;
  partnerCast: string;
  partnerEducation: string;
  partnerProfession: string;
  partnerMaritalStatus: string;
};

type ProfileData = Partial<FormState> & {
  id?: string;
  _id?: string;
  email?: string;
  mobile?: string;
  photos?: string[];
  profileImage?: string | null;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isProfileComplete?: boolean;
  completion?: number;
};

type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const emptyForm: FormState = {
  profileFor: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  state: "",
  city: "",
  religion: "",
  cast: "",
  motherTongue: "",
  maritalStatus: "",
  education: "",
  college: "",
  profession: "",
  company: "",
  income: "",
  aboutYourself: "",
  diet: "",
  smoking: "",
  drinking: "",
  partnerAgeMin: "",
  partnerAgeMax: "",
  partnerState: "",
  partnerCity: "",
  partnerReligion: "",
  partnerCast: "",
  partnerEducation: "",
  partnerProfession: "",
  partnerMaritalStatus: "",
};

const religionOptions = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jain",
  "Buddhist",
  "Parsi",
  "Other",
];

const maritalStatusOptions = [
  "Never married",
  "Divorced",
  "Widowed",
  "Separated",
];

const educationOptions = [
  "High school",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Other",
];

const lifestyleOptions = {
  diet: [
    "Vegetarian",
    "Non-vegetarian",
    "Vegan",
    "Occasionally non-vegetarian",
  ],
  smoking: ["Never", "Occasionally", "Regularly"],
  drinking: ["Never", "Occasionally", "Regularly"],
};

const profileForOptions = [
  "Self",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Relative",
  "Friend",
];

function profileToForm(profile: ProfileData): FormState {
  return {
    profileFor: profile.profileFor || "",
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    gender: profile.gender || "",
    dateOfBirth: profile.dateOfBirth
      ? String(profile.dateOfBirth).slice(0, 10)
      : "",
    state: profile.state || "",
    city: profile.city || "",
    religion: profile.religion || "",
    cast: profile.cast || "",
    motherTongue: profile.motherTongue || "",
    maritalStatus: profile.maritalStatus || "",
    education: profile.education || "",
    college: profile.college || "",
    profession: profile.profession || "",
    company: profile.company || "",
    income: profile.income || "",
    aboutYourself: profile.aboutYourself || "",
    diet: profile.diet || "",
    smoking: profile.smoking || "",
    drinking: profile.drinking || "",
    partnerAgeMin: String(profile.partnerAgeMin ?? ""),
    partnerAgeMax: String(profile.partnerAgeMax ?? ""),
    partnerState: profile.partnerState || "",
    partnerCity: profile.partnerCity || "",
    partnerReligion: profile.partnerReligion || "",
    partnerCast: profile.partnerCast || "",
    partnerEducation: profile.partnerEducation || "",
    partnerProfession: profile.partnerProfession || "",
    partnerMaritalStatus: profile.partnerMaritalStatus || "",
  };
}

function calculateAge(dateOfBirth: string): string {
  if (!dateOfBirth) return "";

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? String(age) : "";
}

function getInitials(firstName: string, lastName: string): string {
  const initials =
    firstName.trim().charAt(0) +
    lastName.trim().charAt(0);

  return initials.toUpperCase() || "U";
}

function revokePreviewUrls(urls: string[]) {
  urls.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
}

async function uploadPhotosToCloudinary(
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return [];

  const signatureResponse = await fetch("/api/cloudinary/sign", {
    method: "POST",
    credentials: "include",
  });

  const signatureData = await signatureResponse.json();

  if (!signatureResponse.ok) {
    throw new Error(
      signatureData?.message ||
        "Unable to prepare image upload.",
    );
  }

  const signature =
    signatureData as CloudinarySignature;

  if (
    !signature.cloudName ||
    !signature.apiKey ||
    !signature.timestamp ||
    !signature.folder ||
    !signature.signature
  ) {
    throw new Error("Invalid Cloudinary upload signature.");
  }

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const uploadData = new FormData();

    uploadData.append("file", file);
    uploadData.append("api_key", signature.apiKey);
    uploadData.append(
      "timestamp",
      String(signature.timestamp),
    );
    uploadData.append("folder", signature.folder);
    uploadData.append("signature", signature.signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      },
    );

    const uploadResult = await uploadResponse.json();

    if (
      !uploadResponse.ok ||
      !uploadResult.secure_url
    ) {
      throw new Error(
        uploadResult?.error?.message ||
          "Unable to upload one of your photos.",
      );
    }

    const optimizedUrl = String(
      uploadResult.secure_url,
    ).replace(
      "/upload/",
      "/upload/f_auto,q_auto,c_limit,w_1600/",
    );

    uploadedUrls.push(optimizedUrl);
  }

  return uploadedUrls;
}

export default function EditProfilePage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savedForm, setSavedForm] =
    useState<FormState>(emptyForm);

  const [photos, setPhotos] = useState<string[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<string[]>([]);

  // New files are stored against their blob preview URL.
  const [pendingFiles, setPendingFiles] = useState<
    Record<string, File>
  >({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFilesRef = useRef<Record<string, File>>({});


  const [completion, setCompletion] = useState(0);
  const [activeSection, setActiveSection] = useState("basic");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  const age = calculateAge(form.dateOfBirth);

  // LOAD PROFILE
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await fetch("/api/profiles", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load profile.",
          );
        }

        if (!mounted) return;

        const profile = data.profile as ProfileData;
        const loadedForm = profileToForm(profile);

        const loadedPhotos = Array.isArray(profile.photos)
          ? profile.photos.filter(
              (photo): photo is string =>
                typeof photo === "string",
            ).slice(0, MAX_PHOTOS)
          : profile.profileImage
            ? [profile.profileImage]
            : [];

        setForm(loadedForm);
        setSavedForm(loadedForm);
        setPhotos(loadedPhotos);
        setSavedPhotos(loadedPhotos);
        setCompletion(Number(profile.completion || 0));
        setHasChanges(false);
      } catch (error) {
        console.error("Load profile error:", error);

        if (mounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load profile.",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // CLEAN UP PENDING PREVIEWS ON UNMOUNT
  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);
  
  // Clean up previews only when component unmounts.
  useEffect(() => {
    return () => {
      Object.keys(pendingFilesRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // UPDATE FIELD
  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((current) => {
      const updated = {
        ...current,
        [field]: value,
      };

      if (field === "religion") {
        updated.cast = "";
      }

      if (field === "partnerReligion") {
        updated.partnerCast = "";
      }

      return updated;
    });

    setHasChanges(true);
    setIsSaved(false);
    setSaveError("");
  };

  // SELECT NEW PHOTOS
  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(
      event.target.files || [],
    );

    // Reset input so the same file can be selected again.
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_PHOTOS - photos.length;

    if (remainingSlots <= 0) {
      setSaveError(
        `You can upload a maximum of ${MAX_PHOTOS} photos.`,
      );
      return;
    }

    const filesToAdd = selectedFiles.slice(
      0,
      remainingSlots,
    );

    if (selectedFiles.length > remainingSlots) {
      setSaveError(
        `Only ${remainingSlots} more photo(s) can be added. Maximum ${MAX_PHOTOS} photos allowed.`,
      );
    } else {
      setSaveError("");
    }

    const newPreviews: string[] = [];
    const newPendingFiles: Record<string, File> = {};

    for (const file of filesToAdd) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setSaveError(
          "Only JPG, PNG and WebP images are allowed.",
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setSaveError(
          `${file.name} is larger than 5 MB.`,
        );
        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      newPreviews.push(previewUrl);
      newPendingFiles[previewUrl] = file;
    }

    if (newPreviews.length === 0) return;

    setPhotos((current) => [
      ...current,
      ...newPreviews,
    ]);

    setPendingFiles((current) => ({
      ...current,
      ...newPendingFiles,
    }));

    setHasChanges(true);
    setIsSaved(false);
  };

  // REMOVE PHOTO
  const removePhoto = (photoToRemove: string) => {
    setPhotos((current) =>
      current.filter((photo) => photo !== photoToRemove),
    );

    setPendingFiles((current) => {
      const updated = { ...current };

      if (updated[photoToRemove]) {
        URL.revokeObjectURL(photoToRemove);
        delete updated[photoToRemove];
      }

      return updated;
    });

    setHasChanges(true);
    setIsSaved(false);
    setSaveError("");
  };

  // MAKE PHOTO PRIMARY
  const makeMainPhoto = (photoToMakeMain: string) => {
    setPhotos((current) => {
      const selectedPhoto = current.find(
        (photo) => photo === photoToMakeMain,
      );

      if (!selectedPhoto || current[0] === selectedPhoto) {
        return current;
      }

      return [
        selectedPhoto,
        ...current.filter(
          (photo) => photo !== selectedPhoto,
        ),
      ];
    });

    setHasChanges(true);
    setIsSaved(false);
    setSaveError("");
  };

  // SAVE PROFILE
 
// SAVE PROFILE
const handleSubmit = async (
  event: FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  if (isSaving) return;

  const minAge = Number(form.partnerAgeMin);
  const maxAge = Number(form.partnerAgeMax);

  if (
    form.partnerAgeMin &&
    form.partnerAgeMax &&
    minAge > maxAge
  ) {
    setSaveError(
      "Minimum partner age cannot be greater than maximum age.",
    );
    return;
  }

  if (
    (form.partnerAgeMin && (minAge < 18 || minAge > 99)) ||
    (form.partnerAgeMax && (maxAge < 18 || maxAge > 99))
  ) {
    setSaveError(
      "Partner age must be between 18 and 99.",
    );
    return;
  }

  setIsSaving(true);
  setIsSaved(false);
  setSaveError("");

  try {
    let finalPhotos = [...photos];

    // Upload only newly added photos.
    const newPhotoEntries = photos.filter(
      (photo) => Boolean(pendingFiles[photo]),
    );

    if (newPhotoEntries.length > 0) {
      setIsUploading(true);

      const filesToUpload = newPhotoEntries.map(
        (previewUrl) => pendingFiles[previewUrl],
      );

      const uploadedUrls =
        await uploadPhotosToCloudinary(filesToUpload);

      const uploadedMap: Record<string, string> = {};

      newPhotoEntries.forEach((previewUrl, index) => {
        uploadedMap[previewUrl] = uploadedUrls[index];
      });

      finalPhotos = photos.map(
        (photo) => uploadedMap[photo] || photo,
      );

      setIsUploading(false);
    }

    // Save profile and delete removed Cloudinary images
    // through the PATCH API.
    const response = await fetch("/api/profiles", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        photos: finalPhotos,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Unable to update profile.",
      );
    }

    const profile = data.profile as ProfileData;
    const updatedForm = profileToForm(profile);

    const updatedPhotos = Array.isArray(profile.photos)
      ? profile.photos
      : finalPhotos;

    // Release temporary preview URLs after successful save.
    revokePreviewUrls(Object.keys(pendingFiles));

    setPendingFiles({});
    setForm(updatedForm);
    setSavedForm(updatedForm);
    setPhotos(updatedPhotos);
    setSavedPhotos(updatedPhotos);
    setCompletion(Number(profile.completion || 0));

    setIsSaved(true);
    setHasChanges(false);
    setShowSuccess(true);

    // The API handles Cloudinary deletion.
    if (data.cloudinaryDeleteFailed) {
      setSaveError(
        "Your profile was saved, but some removed photos could not be deleted from Cloudinary. Please check your server logs.",
      );
    }
  } catch (error) {
    console.error("Save profile error:", error);

    setSaveError(
      error instanceof Error
        ? error.message
        : "Unable to update profile.",
    );
  } finally {
    setIsUploading(false);
    setIsSaving(false);
  }
};



  // HIDE SUCCESS MESSAGE
  useEffect(() => {
    if (!showSuccess) return;

    const timeout = window.setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [showSuccess]);

  // DISCARD CHANGES
  const handleCancel = () => {
    revokePreviewUrls(Object.keys(pendingFiles));

    setPendingFiles({});
    setForm(savedForm);
    setPhotos(savedPhotos);
    setHasChanges(false);
    setIsSaved(false);
    setSaveError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // PROFILE SECTIONS
  const sections = [
    {
      id: "basic",
      label: "Basic details",
      icon: <FiUser aria-hidden="true" />,
    },
    {
      id: "about",
      label: "About me",
      icon: <FiHeart aria-hidden="true" />,
    },
    {
      id: "education",
      label: "Education & career",
      icon: <FiInfo aria-hidden="true" />,
    },
    {
      id: "family",
      label: "Family",
      icon: <FiUser aria-hidden="true" />,
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      icon: <FiShield aria-hidden="true" />,
    },
    {
      id: "preferences",
      label: "Partner preferences",
      icon: <FiHeart aria-hidden="true" />,
    },
  ];

  // LOADING STATE
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className={styles.container}>
          <div className={styles.loadingState}>
            <span className={styles.spinner} />
            <strong>Loading your profile...</strong>
            <p>
              Please wait while we fetch your profile details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (loadError) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className={styles.container}>
          <div className={styles.errorState}>
            <span>
              <FiInfo aria-hidden="true" />
            </span>

            <h1>Unable to load profile</h1>
            <p>{loadError}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <Link
            href="/dashboard/profile"
            className={styles.backButton}
          >
            <FiArrowLeft aria-hidden="true" />
            <span>Back to profile</span>
          </Link>

          <div className={styles.topActions}>
            {hasChanges && (
              <span className={styles.unsaved}>
                Unsaved changes
              </span>
            )}

            {isSaved && (
              <span className={styles.saved}>
                <FiCheck aria-hidden="true" />
                Saved
              </span>
            )}

            <Link
              href="/preview"
              className={styles.previewButton}
            >
              Preview profile
            </Link>
          </div>
        </div>

        {/* PAGE HEADER */}
        <section className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              <FiUser aria-hidden="true" />
              Profile settings
            </span>

            <h1>Edit your profile</h1>

            <p>
              Keep your profile up to date so people can get to
              know the real you.
            </p>
          </div>

          <div className={styles.completionCard}>
          <div className={styles.completionCircle} style={{ "--completion": `${completion}%` } as React.CSSProperties}>
              <strong>{completion}%</strong>
            </div>
            <div>
              <strong>Profile completion</strong>
              <span>
                {completion >= 80
                  ? "Your profile looks great."
                  : "Add more details to improve your profile."}
              </span>
            </div>
          </div>
        </section>

        {saveError && (
          <div className={styles.errorBanner}>
            <FiInfo aria-hidden="true" />
            <span>{saveError}</span>
          </div>
        )}

        <div className={styles.layout}>
          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <span className={styles.sidebarTitle}>
                Profile sections
              </span>

              <nav>
                {sections.map((section) => (
                  <button
                    type="button"
                    key={section.id}
                    className={
                      activeSection === section.id
                        ? styles.activeNav
                        : ""
                    }
                    onClick={() => {
                      setActiveSection(section.id);

                      document
                        .getElementById(section.id)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                  >
                    <span className={styles.navIcon}>
                      {section.icon}
                    </span>

                    <span>{section.label}</span>

                    {activeSection === section.id && (
                      <FiCheck aria-hidden="true" />
                    )}
                  </button>
                ))}
              </nav>

              <div className={styles.sidebarPrivacy}>
                <FiLock aria-hidden="true" />

                <div>
                  <strong>Your privacy</strong>
                  <span>
                    Only information you choose to share appears
                    on your profile.
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN FORM */}
          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            {/* PROFILE PHOTOS */}
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiCamera aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Profile photos</h2>
                    <p>
                      Manage the photos displayed on your profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* MAIN PHOTO PREVIEW */}
              <div className={styles.photoEditor}>
                <div className={styles.profilePhoto}>
                  {photos[0] ? (
                    <img
                      src={photos[0]}
                      alt="Primary profile photo"
                    />
                  ) : (
                    <span>
                      {getInitials(
                        form.firstName,
                        form.lastName,
                      )}
                    </span>
                  )}
                </div>

                <div className={styles.photoInfo}>
                  <strong>Primary profile photo</strong>

                  <p>
                    Your first photo is used as your main
                    profile picture.
                  </p>

                  <span>
                    Select any gallery photo as your main photo.
                    You can also remove photos you no longer want.
                  </span>
                </div>
              </div>

              {/* PHOTO COUNT */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  margin: "20px 0 12px",
                  flexWrap: "wrap",
                }}
              >
                <strong>
                  Your photo gallery
                </strong>

                <span style={{ fontSize: 13, opacity: 0.7 }}>
                  {photos.length}/{MAX_PHOTOS} photos
                </span>
              </div>

              {/* GALLERY */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo}
                    style={{
                      position: "relative",
                      width: 120,
                      height: 150,
                      overflow: "hidden",
                      borderRadius: 14,
                      border:
                        index === 0
                          ? "2px solid #7E2648"
                          : "1px solid #eadde2",
                      background: "#faf7f8",
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {index === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          left: 5,
                          right: 5,
                          bottom: 5,
                          padding: "5px 4px",
                          borderRadius: 7,
                          background: "#7E2648",
                          color: "#fff",
                          fontSize: 10,
                          textAlign: "center",
                          fontWeight: 700,
                        }}
                      >
                        <FiStar
                          style={{
                            display: "inline",
                            marginRight: 3,
                            verticalAlign: "middle",
                          }}
                        />
                        MAIN PHOTO
                      </span>
                    )}

                    {index !== 0 && (
                      <button
                        type="button"
                        title="Make main photo"
                        disabled={isSaving}
                        onClick={() => makeMainPhoto(photo)}
                        style={{
                          position: "absolute",
                          left: 5,
                          right: 5,
                          bottom: 5,
                          padding: "6px 4px",
                          border: 0,
                          borderRadius: 7,
                          background: "rgba(255,255,255,0.95)",
                          color: "#7E2648",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Make main
                      </button>
                    )}

                    <button
                      type="button"
                      title="Remove photo"
                      disabled={isSaving}
                      onClick={() => removePhoto(photo)}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        display: "grid",
                        placeItems: "center",
                        width: 28,
                        height: 28,
                        border: 0,
                        borderRadius: "50%",
                        background: "#fff",
                        color: "#b42345",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      <FiX aria-hidden="true" />
                    </button>
                  </div>
                ))}

                {/* ADD PHOTO */}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      width: 120,
                      height: 150,
                      border: "2px dashed #d9bac7",
                      borderRadius: 14,
                      background: "#fff9fb",
                      color: "#7E2648",
                      cursor: "pointer",
                    }}
                  >
                    <FiUpload size={24} />
                    <strong style={{ fontSize: 12 }}>
                      Add photos
                    </strong>
                    <span style={{ fontSize: 10 }}>
                      {MAX_PHOTOS - photos.length} remaining
                    </span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={handlePhotoChange}
              />

              <p
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#777",
                }}
              >
                JPG, PNG or WebP · Maximum 5 MB per photo ·
                Up to 6 photos
              </p>

              <div className={styles.photoPrivacy}>
                <FiShield aria-hidden="true" />
                <span>
                  Your photo visibility can be controlled from
                  your privacy settings.
                </span>
              </div>
            </section>

            {/* BASIC DETAILS */}
            <section id="basic" className={styles.card}>
              <SectionHeader
                icon={<FiUser aria-hidden="true" />}
                title="Basic details"
                description="Update your personal and basic information."
              />

              <div className={styles.fieldsGrid}>
                <SelectField
                  label="Profile created for"
                  value={form.profileFor}
                  options={profileForOptions}
                  onChange={(value) =>
                    updateField("profileFor", value)
                  }
                />

                <SelectField
                  label="Gender"
                  value={form.gender}
                  options={["Male", "Female", "Other"]}
                  onChange={(value) =>
                    updateField("gender", value)
                  }
                />

                <Field
                  label="First name"
                  value={form.firstName}
                  onChange={(value) =>
                    updateField("firstName", value)
                  }
                  required
                />

                <Field
                  label="Last name"
                  value={form.lastName}
                  onChange={(value) =>
                    updateField("lastName", value)
                  }
                />

                <Field
                  label="Date of birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(value) =>
                    updateField("dateOfBirth", value)
                  }
                  required
                />

                <Field
                  label="Age"
                  value={age}
                  readOnly
                  onChange={() => {}}
                />

                <Field
                  label="State"
                  value={form.state}
                  icon={<FiMapPin aria-hidden="true" />}
                  onChange={(value) =>
                    updateField("state", value)
                  }
                  required
                />

                <Field
                  label="City"
                  value={form.city}
                  icon={<FiMapPin aria-hidden="true" />}
                  onChange={(value) =>
                    updateField("city", value)
                  }
                  required
                />

                <SelectField
                  label="Religion"
                  value={form.religion}
                  options={religionOptions}
                  onChange={(value) =>
                    updateField("religion", value)
                  }
                />

                <Field
                  label="Caste"
                  value={form.cast}
                  onChange={(value) =>
                    updateField("cast", value)
                  }
                />

                <Field
                  label="Mother tongue"
                  value={form.motherTongue}
                  onChange={(value) =>
                    updateField("motherTongue", value)
                  }
                />

                <SelectField
                  label="Marital status"
                  value={form.maritalStatus}
                  options={maritalStatusOptions}
                  onChange={(value) =>
                    updateField("maritalStatus", value)
                  }
                />
              </div>
            </section>

          

            {/* EDUCATION & CAREER */}
            <section id="education" className={styles.card}>
              <SectionHeader
                icon={<FiInfo aria-hidden="true" />}
                title="Education & career"
                description="Add your academic and professional background."
              />

              <h3 className={styles.subTitle}>Education</h3>

              <div className={styles.fieldsGrid}>
                <SelectField
                  label="Highest education"
                  value={form.education}
                  options={educationOptions}
                  onChange={(value) =>
                    updateField("education", value)
                  }
                />

                <Field
                  label="College / Institute"
                  value={form.college}
                  onChange={(value) =>
                    updateField("college", value)
                  }
                />
              </div>

              <div className={styles.divider} />

              <h3 className={styles.subTitle}>Career</h3>

              <div className={styles.fieldsGrid}>
                <Field
                  label="Profession"
                  value={form.profession}
                  onChange={(value) =>
                    updateField("profession", value)
                  }
                />

                <Field
                  label="Company"
                  value={form.company}
                  onChange={(value) =>
                    updateField("company", value)
                  }
                />

                <Field
                  label="Annual income"
                  value={form.income}
                  onChange={(value) =>
                    updateField("income", value)
                  }
                />
              </div>
            </section>

            {/* FAMILY */}
            {/* <section id="family" className={styles.card}>
              <SectionHeader
                icon={<FiUser aria-hidden="true" />}
                title="Family details"
                description="Add general information about your family."
              />

              <div className={styles.fieldsGrid}>
                <Field
                  label="Father's occupation"
                  value={form.fatherOccupation}
                  onChange={(value) =>
                    updateField("fatherOccupation", value)
                  }
                />

                <Field
                  label="Mother's occupation"
                  value={form.motherOccupation}
                  onChange={(value) =>
                    updateField("motherOccupation", value)
                  }
                />
              </div>

              <div className={styles.tip}>
                <FiLock aria-hidden="true" />
                <span>
                  Keep sensitive family details private. Only
                  share information you are comfortable displaying.
                </span>
              </div>
            </section> */}

            {/* LIFESTYLE */}
            <section id="lifestyle" className={styles.card}>
              <SectionHeader
                icon={<FiShield aria-hidden="true" />}
                title="Lifestyle"
                description="Share lifestyle choices that may matter to you."
              />

              <div className={styles.fieldsGrid}>
                <SelectField
                  label="Diet"
                  value={form.diet}
                  options={lifestyleOptions.diet}
                  onChange={(value) =>
                    updateField("diet", value)
                  }
                />

                <SelectField
                  label="Smoking"
                  value={form.smoking}
                  options={lifestyleOptions.smoking}
                  onChange={(value) =>
                    updateField("smoking", value)
                  }
                />

                <SelectField
                  label="Drinking"
                  value={form.drinking}
                  options={lifestyleOptions.drinking}
                  onChange={(value) =>
                    updateField("drinking", value)
                  }
                />
              </div>
            </section>

            {/* PARTNER PREFERENCES */}
            <section id="preferences" className={styles.card}>
              <SectionHeader
                icon={<FiHeart aria-hidden="true" />}
                title="Partner preferences"
                description="Tell us what you are looking for in a partner."
              />

              <div className={styles.ageRange}>
                <div className={styles.ageLabel}>
                  <span>Preferred age range</span>
                  <strong>
                    {form.partnerAgeMin || "—"} –{" "}
                    {form.partnerAgeMax || "—"} years
                  </strong>
                </div>

                <div className={styles.ageFields}>
                  <Field
                    label="Minimum age"
                    type="number"
                    value={form.partnerAgeMin}
                    onChange={(value) =>
                      updateField("partnerAgeMin", value)
                    }
                  />

                  <span className={styles.ageDash}>—</span>

                  <Field
                    label="Maximum age"
                    type="number"
                    value={form.partnerAgeMax}
                    onChange={(value) =>
                      updateField("partnerAgeMax", value)
                    }
                  />
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <Field
                  label="Preferred state"
                  value={form.partnerState}
                  icon={<FiMapPin aria-hidden="true" />}
                  onChange={(value) =>
                    updateField("partnerState", value)
                  }
                />

                <Field
                  label="Preferred city"
                  value={form.partnerCity}
                  icon={<FiMapPin aria-hidden="true" />}
                  onChange={(value) =>
                    updateField("partnerCity", value)
                  }
                />

                <SelectField
                  label="Preferred religion"
                  value={form.partnerReligion}
                  options={religionOptions}
                  onChange={(value) =>
                    updateField("partnerReligion", value)
                  }
                />

                <Field
                  label="Preferred caste"
                  value={form.partnerCast}
                  onChange={(value) =>
                    updateField("partnerCast", value)
                  }
                />

                <SelectField
                  label="Preferred education"
                  value={form.partnerEducation}
                  options={["Any", ...educationOptions]}
                  onChange={(value) =>
                    updateField("partnerEducation", value)
                  }
                />

                <Field
                  label="Preferred profession"
                  value={form.partnerProfession}
                  onChange={(value) =>
                    updateField("partnerProfession", value)
                  }
                />

                <SelectField
                  label="Preferred marital status"
                  value={form.partnerMaritalStatus}
                  options={["Any", ...maritalStatusOptions]}
                  onChange={(value) =>
                    updateField("partnerMaritalStatus", value)
                  }
                />
              </div>

              <div className={styles.preferenceNote}>
                <FiInfo aria-hidden="true" />
                <span>
                  Preferences help us personalize your recommendations.
                  They do not guarantee a specific match.
                </span>
              </div>
            </section>
                  {/* ABOUT ME */}
            <section id="about" className={styles.card}>
              <SectionHeader
                icon={<FiHeart aria-hidden="true" />}
                title="About me"
                description="Share what makes you unique."
              />

              <div className={styles.textareaWrapper}>
                <textarea
                  value={form.aboutYourself}
                  onChange={(event) =>
                    updateField(
                      "aboutYourself",
                      event.target.value,
                    )
                  }
                  maxLength={500}
                  rows={6}
                  placeholder="Tell people about yourself..."
                />

                <span>
                  {form.aboutYourself.length}/500
                </span>
              </div>

              <div className={styles.tip}>
                <FiInfo aria-hidden="true" />
                <span>
                  Talk about your personality, interests, values
                  and what matters to you. Avoid sharing phone
                  numbers or email addresses.
                </span>
              </div>
            </section>
            {/* VERIFICATION */}
            <section className={styles.verificationCard}>
              <div className={styles.verificationIcon}>
                <FiShield aria-hidden="true" />
              </div>

              <div>
                <strong>Want to build more trust?</strong>
                <p>
                  Complete your profile verification to show
                  verified information where applicable.
                </p>
              </div>

              <Link href="/dashboard/verification">
                Verification
              </Link>
            </section>

            {/* FORM ACTIONS */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={isSaving || !hasChanges}
              >
                <FiTrash2 aria-hidden="true" />
                <span>Discard changes</span>
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <span className={styles.spinner} />
                    <span>
                      {isUploading
                        ? "Uploading photos..."
                        : "Saving changes..."}
                    </span>
                  </>
                ) : (
                  <>
                    <FiSave aria-hidden="true" />
                    <span>Save changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SUCCESS MESSAGE */}
        {showSuccess && (
          <div className={styles.successToast}>
            <span>
              <FiCheck aria-hidden="true" />
            </span>

            <div>
              <strong>Profile updated</strong>
              <p>
                Your changes have been saved successfully.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// REUSABLE SECTION HEADER
function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <span className={styles.sectionIcon}>{icon}</span>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

// REUSABLE INPUT FIELD
function Field({
  label,
  value,
  onChange,
  type = "text",
  icon,
  required = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: ReactNode;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label>
        <span>{label}</span>
        {required && <small>Required</small>}
      </label>

      <div className={styles.inputWrapper}>
        {icon && (
          <span className={styles.fieldIcon}>{icon}</span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={required}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

// REUSABLE SELECT FIELD
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const selectOptions =
    value && !options.includes(value)
      ? [value, ...options]
      : options;

  return (
    <div className={styles.field}>
      <label>
        <span>{label}</span>
      </label>

      <div className={styles.selectWrapper}>
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          <option value="">Select {label}</option>

          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <FiChevronDown aria-hidden="true" />
      </div>
    </div>
  );
}