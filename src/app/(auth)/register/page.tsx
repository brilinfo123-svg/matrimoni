"use client";

import Link from "next/link";
import { locationOptions } from "@/data/locationOptions";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiHeart,
  FiHome,
  FiImage,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import styles from "./register.module.scss";

type FormData = {
  profileFor: string;

  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;

  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;

  state: string;
  city: string;

  religion: string;
  motherTongue: string;
  maritalStatus: string;

  education: string;
  college: string;
  profession: string;
  company: string;
  income: string;

  familyType: string;
  familyValues: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  lifestyle: string;
  diet: string;
  smoking: string;
  drinking: string;

  partnerAgeMin: string;
  partnerAgeMax: string;

  partnerState: string;
  partnerCity: string;

  partnerReligion: string;
  partnerEducation: string;
  partnerProfession: string;
  partnerMaritalStatus: string;
  partnerLifestyle: string;

  photos: string[];
};

const steps = [
  {
    number: 1,
    title: "Profile For",
    shortTitle: "Profile",
    icon: FiUsers,
  },
  {
    number: 2,
    title: "Account",
    shortTitle: "Account",
    icon: FiUser,
  },
  {
    number: 3,
    title: "Basic Details",
    shortTitle: "Basic",
    icon: FiHeart,
  },
  {
    number: 4,
    title: "Education & Career",
    shortTitle: "Career",
    icon: FiBriefcase,
  },
  {
    number: 5,
    title: "Family & Lifestyle",
    shortTitle: "Lifestyle",
    icon: FiUsers,
  },
  {
    number: 6,
    title: "Partner Preferences",
    shortTitle: "Preferences",
    icon: FiHeart,
  },
  {
    number: 7,
    title: "Photos",
    shortTitle: "Photos",
    icon: FiImage,
  },
];

const initialFormData: FormData = {
  profileFor: "",

  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",

  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",

  state: "",
  city: "",

  religion: "",
  motherTongue: "",
  maritalStatus: "",

  education: "",
  college: "",
  profession: "",
  company: "",
  income: "",

  familyType: "",
  familyValues: "",
  fatherOccupation: "",
  motherOccupation: "",
  siblings: "",
  lifestyle: "",
  diet: "",
  smoking: "",
  drinking: "",

  partnerAgeMin: "24",
  partnerAgeMax: "32",

  partnerState: "",
  partnerCity: "",

  partnerReligion: "",
  partnerEducation: "",
  partnerProfession: "",
  partnerMaritalStatus: "",
  partnerLifestyle: "",

  photos: [],
};


type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

async function uploadPhotosToCloudinary(
  files: File[]
): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  // Step A: Backend se secure signature lo
  const signatureResponse = await fetch(
    "/api/cloudinary/sign",
    {
      method: "POST",
    }
  );

  const signatureData: CloudinarySignature & {
    message?: string;
  } = await signatureResponse.json();

  if (!signatureResponse.ok) {
    throw new Error(
      signatureData.message ||
        "Unable to prepare image upload."
    );
  }

  // Step B: Images Cloudinary par upload karo
  const uploadedUrls = await Promise.all(
    files.map(async (file) => {
      const uploadFormData = new FormData();

      uploadFormData.append("file", file);
      uploadFormData.append(
        "api_key",
        signatureData.apiKey
      );
      uploadFormData.append(
        "timestamp",
        String(signatureData.timestamp)
      );
      uploadFormData.append(
        "folder",
        signatureData.folder
      );
      uploadFormData.append(
        "signature",
        signatureData.signature
      );

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadResult.error?.message ||
            "Image upload failed."
        );
      }

      // Automatic format and quality optimization
      const optimizedUrl = uploadResult.secure_url.replace(
        "/upload/",
        "/upload/f_auto,q_auto,c_limit,w_1600/"
      );

      return optimizedUrl;
    })
  );

  return uploadedUrls;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);


  const currentStepData = steps[currentStep - 1];



  const progress = useMemo(
    () => (currentStep / steps.length) * 100,
    [currentStep],
  );


  // const profileForOptions = [
  //   { value: "self", label: "My Self", icon: "👤" },
  //   { value: "son", label: "My Son", icon: "👨" },
  //   { value: "daughter", label: "My Daughter", icon: "👧" },
  //   { value: "brother", label: "My Brother", icon: "👨" },
  //   { value: "sister", label: "My Sister", icon: "👩" },
  //   { value: "friend", label: "My Friend", icon: "👥" },
  //   { value: "relative", label: "My Relative", icon: "👪" },
  // ];
  
  // const genderOptions = [
  //   {
  //     value: "male",
  //     label: "Male",
  //   },
  //   {
  //     value: "female",
  //     label: "Female",
  //   },
  //   {
  //     value: "other",
  //     label: "Other",
  //   },
  // ];
  
  const updateField = ( field: keyof FormData, value: string, ) => { setFormData((previous) => ({ ...previous, [field]: value, })); setErrorMessage(""); if (field === "email") { setEmailError(""); } if (field === "mobile") { setMobileError(""); } };

  const validateStep = () => {
    // Step 1 - Profile For
    if (currentStep === 1) {
      if (!formData.profileFor) {
        return "Please select who this profile is for.";
      }
  
      if (!formData.gender) {
        return "Please select gender.";
      }
    }
  
    // Step 2 - Account
    if (currentStep === 2) {

      const email = formData.email.trim(); 
      const mobile = formData.mobile.trim();
      if (!formData.email.trim()) {
        return "Please enter your email address.";
      }
  
      if (!formData.password) {
        return "Please create a password.";
      }
  
      if (formData.password.length < 8) {
        return "Password must contain at least 8 characters.";
      }
  
      if (formData.password !== formData.confirmPassword) {
        return "Passwords do not match.";
      }
    }
  
    // Step 3 - Basic Details
    if (currentStep === 3) {
      if (!formData.firstName.trim()) {
        return "Please enter your first name.";
      }
  
      if (!formData.dateOfBirth) {
        return "Please select your date of birth.";
      }
  
      if (!formData.state.trim()) {
        return "Please select your state.";
      }
      if (!formData.city.trim()) {
        return "Please select your city.";
      }
    }
  
    // Step 4 - Education & Career
    if (currentStep === 4) {
      if (!formData.education) {
        return "Please select your highest education.";
      }
  
      if (!formData.profession) {
        return "Please select your profession.";
      }
    }
  
    // Step 5 - Family & Lifestyle
    if (currentStep === 5) {
      // if (!formData.familyType) {
      //   return "Please select your family type.";
      // }
  
      if (!formData.lifestyle) {
        return "Please select your lifestyle.";
      }
    }
  
    // Step 6 - Partner Preferences
    if (currentStep === 6) {
      if (!formData.partnerAgeMin || !formData.partnerAgeMax) {
        return "Please select your preferred age range.";
      }
    }
  
    return "";
  };


const handleNext = async () => {
  const validationError = validateStep();

  if (validationError) {
    setErrorMessage(validationError);
    return;
  }

  // --------------------------------
  // STEP 2 ACCOUNT AVAILABILITY
  // --------------------------------

  if (currentStep === 2) {
    setEmailError("");
    setMobileError("");
    setErrorMessage("");
    setIsCheckingAccount(true);

    try {
      const response = await fetch(
        "/api/auth/check-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            mobile: formData.mobile.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.message ||
            "Unable to verify account details.",
        );

        return;
      }

      let hasExistingAccount = false;

      // --------------------------------
      // EMAIL ALREADY REGISTERED
      // --------------------------------

      if (result.emailExists) {
        setEmailError(
          "This email address is already registered.",
        );

        hasExistingAccount = true;
      }

      // --------------------------------
      // MOBILE ALREADY REGISTERED
      // --------------------------------

      if (result.mobileExists) {
        setMobileError(
          "This mobile number is already registered.",
        );

        hasExistingAccount = true;
      }

      // Do NOT move to next step
      if (hasExistingAccount) {
        return;
      }
    } catch (error) {
      console.error(
        "ACCOUNT_AVAILABILITY_ERROR:",
        error,
      );

      setErrorMessage(
        "Unable to verify your email and mobile number. Please try again.",
      );

      return;
    } finally {
      setIsCheckingAccount(false);
    }
  }

  setErrorMessage("");

  if (currentStep < steps.length) {
    setCurrentStep(
      (previous) => previous + 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};


  const handleBack = () => {
    setErrorMessage("");

    if (currentStep > 1) {
      setCurrentStep((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };


  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
  
    if (!files.length) return;
  
    const remainingSlots = 6 - formData.photos.length;
  
    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type);
  
      const isValidSize = file.size <= 5 * 1024 * 1024;
  
      return isValidType && isValidSize;
    });
  
    if (validFiles.length !== files.length) {
      setErrorMessage(
        "Only JPG, PNG or WebP images up to 5 MB are allowed."
      );
    }
  
    const filesToAdd = validFiles.slice(0, remainingSlots);
  
    if (filesToAdd.length === 0) return;
  
    const previews = filesToAdd.map((file) =>
      URL.createObjectURL(file)
    );
  
    setPhotoFiles((previous) => [
      ...previous,
      ...filesToAdd,
    ]);
  
    setFormData((previous) => ({
      ...previous,
      photos: [
        ...previous.photos,
        ...previews,
      ],
    }));
  };

  const removePhoto = (index: number) => {
    const previewUrl = formData.photos[index];
  
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  
    setPhotoFiles((previous) =>
      previous.filter((_, photoIndex) => photoIndex !== index)
    );
  
    setFormData((previous) => ({
      ...previous,
      photos: previous.photos.filter(
        (_, photoIndex) => photoIndex !== index
      ),
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
  
    const validationError = validateStep();
  
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
  
    setIsSubmitting(true);
    setErrorMessage("");
  
    try {
      // Upload photos to Cloudinary
      const uploadedPhotoUrls =
        await uploadPhotosToCloudinary(photoFiles);
  
      // Send permanent image URLs to backend
      const registrationPayload = {
        ...formData,
        photos: uploadedPhotoUrls,
      };
  
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationPayload),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        setErrorMessage(
          result.message || "Unable to create your account."
        );
        return;
      }
  
      setIsComplete(true);
    } catch (error) {
      console.error("Registration error:", error);
  
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload photos or create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <section className={styles.completeWrapper}>
          <div className={styles.completeCard}>
            <div className={styles.completeIcon}>
              <FiCheck aria-hidden="true" />
            </div>

            <span className={styles.completeEyebrow}>
              Profile created
            </span>

            <h1>
              Your journey
              <span> starts here.</span>
            </h1>

            <p>
              Your profile has been prepared successfully.
              Complete verification to start discovering
              meaningful connections.
            </p>

            <div className={styles.completeFeatures}>
              <div>
                <FiShield aria-hidden="true" />
                <span>Privacy focused</span>
              </div>

              <div>
                <FiHeart aria-hidden="true" />
                <span>Personalized matches</span>
              </div>

              <div>
                <FiUsers aria-hidden="true" />
                <span>Meaningful connections</span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className={styles.completeButton}
            >
              <span>Continue to your profile</span>
              <FiArrowRight aria-hidden="true" />
            </Link>

            <p className={styles.completeNote}>
              You can update your profile and preferences
              anytime.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.wrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <span className={styles.logoText}>
                <strong>Matrimonial</strong>
                <small>Meaningful connections</small>
              </span>
            </Link>

            <div className={styles.sidebarIntro}>
              <span className={styles.sidebarEyebrow}>
                Create your profile
              </span>

              <h1>
                Tell us a little
                <span> about you.</span>
              </h1>

              <p>
                A thoughtful profile helps us show you
                people who may genuinely fit your values,
                lifestyle and future goals.
              </p>
            </div>

            <div className={styles.stepList}>
              {steps.map((step) => {
                const Icon = step.icon;

                const isActive =
                  currentStep === step.number;

                const isCompleted =
                  currentStep > step.number;

                return (
                  <button
                    key={step.number}
                    type="button"
                    className={`${styles.stepItem} ${
                      isActive
                        ? styles.stepItemActive
                        : ""
                    } ${
                      isCompleted
                        ? styles.stepItemCompleted
                        : ""
                    }`}
                    onClick={() => {
                      if (isCompleted) {
                        setCurrentStep(step.number);
                        setErrorMessage("");
                      }
                    }}
                    disabled={
                      !isCompleted && !isActive
                    }
                  >
                    <span className={styles.stepIcon}>
                      {isCompleted ? (
                        <FiCheck aria-hidden="true" />
                      ) : (
                        <Icon aria-hidden="true" />
                      )}
                    </span>

                    <span className={styles.stepInfo}>
                      <small>
                        Step {step.number}
                      </small>

                      <strong>{step.title}</strong>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.sidebarTrust}>
              <FiShield aria-hidden="true" />

              <div>
                <strong>Your privacy matters</strong>
                <span>
                  You control what information you
                  share and when.
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.mobileTop}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <span className={styles.logoText}>
                <strong>Matrimonial</strong>
                <small>Meaningful connections</small>
              </span>
            </Link>
          </div>

          <div className={styles.mobileProgress}>
            <div className={styles.mobileProgressTop}>
              <span>
                Step {currentStep} of {steps.length}
              </span>

              <strong>{currentStepData.title}</strong>
            </div>

            <div className={styles.progressTrack}>
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className={styles.contentInner}>
            <div className={styles.contentHeader}>
              <div>
                <span className={styles.contentEyebrow}>
                  Step {currentStep} of {steps.length}
                </span>

                <h2>{currentStepData.title}</h2>

                <p>
                    {currentStep === 1 &&
                      "Tell us who this matrimonial profile is being created for."}

                    {currentStep === 2 &&
                      "Create your secure account to get started."}

                    {currentStep === 3 &&
                      "Help people understand who you are."}

                    {currentStep === 4 &&
                      "Share the education and career details that matter to you."}

                    {currentStep === 5 &&
                      "Tell us about your family and everyday lifestyle."}

                    {currentStep === 6 &&
                      "Tell us what you value in a potential partner."}

                    {currentStep === 7 &&
                      "Add photos that help your profile feel personal."}
                  </p>
              </div>

              <div className={styles.desktopProgress}>
                <span>{Math.round(progress)}%</span>

                <div className={styles.progressTrack}>
                  <span
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className={styles.errorMessage}>
                <span>!</span>
                <p>{errorMessage}</p>
              </div>
            )}

            <form
              className={styles.form}
              onSubmit={(event) => {
                if (currentStep === steps.length) {
                  handleSubmit(event);
                  return;
                }

                event.preventDefault();
                handleNext();
              }}
            >
{currentStep === 1 && (
  <ProfileForStep
    formData={formData}
    updateField={updateField}
  />
)}

{currentStep === 2 && (
  <AccountStep
    formData={formData}
    updateField={updateField}
    showPassword={showPassword}
    showConfirmPassword={showConfirmPassword}
    setShowPassword={setShowPassword}
    setShowConfirmPassword={setShowConfirmPassword}
    emailError={emailError}
    mobileError={mobileError}
  />
)}

{currentStep === 3 && (
  <BasicDetailsStep
    formData={formData}
    updateField={updateField}
  />
)}

{currentStep === 4 && (
  <CareerStep
    formData={formData}
    updateField={updateField}
  />
)}

{currentStep === 5 && (
  <FamilyLifestyleStep
    formData={formData}
    updateField={updateField}
  />
)}

{currentStep === 6 && (
  <PartnerPreferencesStep
    formData={formData}
    updateField={updateField}
  />
)}

{currentStep === 7 && (
  <PhotosStep
    photos={formData.photos}
    onPhotoChange={handlePhotoChange}
    onRemovePhoto={removePhoto}
  />
)}

              <div className={styles.formFooter}>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                  >
                    <FiArrowLeft aria-hidden="true" />
                    <span>Back</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className={styles.loginLink}
                  >
                    Already have an account?
                    <strong> Sign in</strong>
                  </Link>
                )}

                <button
                  type="submit"
                  className={styles.nextButton}
                  disabled={
                    isSubmitting || isCheckingAccount
                  }
                >
                 {isSubmitting || isCheckingAccount ? (
                  <>
                    <span className={styles.spinner} />

                    <span>
                      {isCheckingAccount
                        ? "Checking details..."
                        : "Creating profile..."}
                    </span>
                  </>
                ) : currentStep === steps.length ? (
                  <>
                    <span>Create my profile</span>
                    <FiCheck aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <FiArrowRight aria-hidden="true" />
                  </>
                )}
                </button>
              </div>

              <p className={styles.terms}>
                By creating an account, you agree to our{" "}
                <Link href="/terms">Terms</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

type StepProps = {
  formData: FormData;
  updateField: (
    field: keyof FormData,
    value: string,
  ) => void;
};

function StateCityField({
  state,
  city,
  stateId,
  cityId,
  onStateChange,
  onCityChange,
  required = false,
}: {
  state: string;
  city: string;
  stateId: string;
  cityId: string;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  required?: boolean;
}) {
  const [citySearch, setCitySearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);

  const selectedLocation = locationOptions.find(
    (location) => location.state === state,
  );

  const cities = selectedLocation?.cities || [];

  const filteredCities = cities.filter((cityName) =>
    cityName
      .toLowerCase()
      .includes(citySearch.toLowerCase()),
  );

  return (
    <>
      {/* ================= STATE ================= */}
      <div className={styles.field}>
        <label htmlFor={stateId}>
          State
          {required && (
            <span className={styles.required}>*</span>
          )}
        </label>

        <div className={styles.selectWrapper}>
          <select
            id={stateId}
            value={state}
            onChange={(event) => {
              const newState = event.target.value;

              onStateChange(newState);

              // Reset city when state changes
              onCityChange("");
              setCitySearch("");
              setIsCityOpen(false);
            }}
            required={required}
          >
            <option value="" disabled>
              Select state
            </option>

            {locationOptions.map((location) => (
              <option
                key={location.state}
                value={location.state}
              >
                {location.state}
              </option>
            ))}
          </select>

          <FiChevronDown
            className={styles.selectIcon}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ================= CITY ================= */}
      {/* ================= CITY ================= */}
      <div className={`${styles.field} ${styles.cityField}`}>
        <label htmlFor={cityId}>
          City
          {required && (
            <span className={styles.required}>*</span>
          )}
        </label>

        <div className={styles.citySelectWrapper}>
          <FiMapPin
            className={styles.cityInputIcon}
            aria-hidden="true"
          />

          <input
            id={cityId}
            type="text"
            value={citySearch || city}
            placeholder={
              state
                ? "Search or select city"
                : "Select state first"
            }
            disabled={!state}
            autoComplete="off"
            required={required}
            onFocus={() => {
              if (!state) return;

              setCitySearch("");
              setIsCityOpen(true);
            }}
            onClick={() => {
              if (!state) return;

              setIsCityOpen(true);
            }}
            onChange={(event) => {
              if (!state) return;

              setCitySearch(event.target.value);
              setIsCityOpen(true);

              if (city) {
                onCityChange("");
              }
            }}
          />

          {state && (
            <button
              type="button"
              className={styles.cityDropdownButton}
              onClick={() => {
                setIsCityOpen((previous) => !previous);
                setCitySearch("");
              }}
              aria-label={
                isCityOpen
                  ? "Close city list"
                  : "Open city list"
              }
            >
              <FiChevronDown
                className={
                  isCityOpen
                    ? styles.cityChevronOpen
                    : ""
                }
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {state && isCityOpen && (
          <div className={styles.cityOptions}>
            {filteredCities.length > 0 ? (
              filteredCities.map((cityName) => (
                <button
                  key={cityName}
                  type="button"
                  className={`${styles.cityOption} ${
                    city === cityName
                      ? styles.cityOptionActive
                      : ""
                  }`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    onCityChange(cityName);
                    setCitySearch("");
                    setIsCityOpen(false);
                  }}
                >
                  <FiMapPin aria-hidden="true" />

                  <span>{cityName}</span>

                  {city === cityName && (
                    <FiCheck
                      className={styles.cityCheck}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))
            ) : (
              <div className={styles.noCityFound}>
                No city found in {state}
              </div>
            )}
          </div>
        )}

        {!state && (
          <span className={styles.fieldHint}>
            Select a state first to see available cities.
          </span>
        )}
      </div>
    </>
  );
}

function ProfileForStep({
  formData,
  updateField,
}: StepProps) {
  const profileForOptions = [
    {
      value: "self",
      label: "My Self",
      description: "I am creating my own profile",
      icon: "👤",
    },
    {
      value: "son",
      label: "My Son",
      description: "I am creating a profile for my son",
      icon: "👨",
    },
    {
      value: "daughter",
      label: "My Daughter",
      description: "I am creating a profile for my daughter",
      icon: "👧",
    },
    {
      value: "brother",
      label: "My Brother",
      description: "I am creating a profile for my brother",
      icon: "👨",
    },
    {
      value: "sister",
      label: "My Sister",
      description: "I am creating a profile for my sister",
      icon: "👩",
    },
    {
      value: "friend",
      label: "My Friend",
      description: "I am creating a profile for my friend",
      icon: "👥",
    },
    {
      value: "relative",
      label: "My Relative",
      description: "I am creating a profile for my relative",
      icon: "👪",
    },
  ];

  const genderOptions = [
    {
      value: "male",
      label: "Male",
      icon: "♂",
    },
    {
      value: "female",
      label: "Female",
      icon: "♀",
    },
    // {
    //   value: "other",
    //   label: "Other",
    //   icon: "⚧",
    // },
  ];

  return (
    <div className={styles.profileForStep}>
      <div className={styles.profileForIntro}>
        <div className={styles.profileForIcon}>
          <FiUsers aria-hidden="true" />
        </div>

        <div>
          <h3>Who is this profile for?</h3>

          <p>
            Tell us who you are creating this matrimonial
            profile for. This helps us personalize the
            registration experience.
          </p>
        </div>
      </div>

      <div className={styles.profileForGrid}>
        {profileForOptions.map((option) => {
          const isSelected =
            formData.profileFor === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.profileForCard} ${
                isSelected
                  ? styles.profileForCardActive
                  : ""
              }`}
              onClick={() =>
                updateField("profileFor", option.value)
              }
            >
              <span className={styles.profileForEmoji}>
                {option.icon}
              </span>

              <span className={styles.profileForCardContent}>
                <strong>{option.label}</strong>

                <small>{option.description}</small>
              </span>

              <span
                className={styles.profileForRadio}
                aria-hidden="true"
              >
                {isSelected && <FiCheck />}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.genderSection}>
        <div className={styles.genderHeader}>
          <div>
            <h3>Choose gender</h3>

            <p>
              Select the gender for the person whose
              profile you are creating.
            </p>
          </div>
        </div>

        <div className={styles.genderGrid}>
          {genderOptions.map((option) => {
            const isSelected =
              formData.gender === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.genderCard} ${
                  isSelected
                    ? styles.genderCardActive
                    : ""
                }`}
                onClick={() =>
                  updateField("gender", option.value)
                }
              >
                <span className={styles.genderIcon}>
                  {option.icon}
                </span>

                <strong>{option.label}</strong>

                {isSelected && (
                  <span className={styles.genderCheck}>
                    <FiCheck />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.infoCard}>
        <FiShield aria-hidden="true" />

        <div>
          <strong>Your information stays private</strong>

          <p>
            You can update profile details later from
            your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
  
function AccountStep({
  formData,
  updateField,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  emailError,
  mobileError,
}: StepProps & {
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (value: boolean) => void;
  setShowConfirmPassword: (value: boolean) => void;
  emailError: string;
  mobileError: string;
}) {
  return (
    <div className={styles.fieldsGrid}>
      <div className={styles.field}>
  <label htmlFor="email">
    Email address
    <span className={styles.required}>*</span>
  </label>

  <div
    className={`${styles.inputWrapper} ${
      emailError ? styles.inputError : ""
    }`}
  >
    <FiMail
      className={styles.inputIcon}
      aria-hidden="true"
    />

    <input
      id="email"
      type="email"
      value={formData.email}
      onChange={(event) =>
        updateField(
          "email",
          event.target.value,
        )
      }
      placeholder="Enter your email address"
      autoComplete="email"
      required
    />
  </div>

  {emailError && (
    <span className={styles.fieldError}>
      {emailError}
    </span>
  )}

  <span className={styles.fieldHint}>
    We&apos;ll use this to secure your account.
  </span>
</div>
<div className={styles.field}>
  <label htmlFor="mobile">
    Mobile number
    <span className={styles.required}>*</span>
  </label>

  <div
    className={`${styles.inputWrapper} ${
      mobileError ? styles.inputError : ""
    }`}
  >
    <FiPhone
      className={styles.inputIcon}
      aria-hidden="true"
    />

    <input
      id="mobile"
      type="tel"
      value={formData.mobile}
      onChange={(event) => {
        const value = event.target.value
          .replace(/\D/g, "")
          .slice(0, 10);

        updateField("mobile", value);
      }}
      placeholder="Enter your 10-digit mobile number"
      autoComplete="tel"
      inputMode="numeric"
      pattern="[0-9]{10}"
      maxLength={10}
      required
    />
  </div>

  {mobileError && (
    <span className={styles.fieldError}>
      {mobileError}
    </span>
  )}

  <span className={styles.fieldHint}>
    Enter a valid 10-digit mobile number.
  </span>
</div>
      <div className={styles.field}>
        <label htmlFor="password">
          Create password
          <span className={styles.required}>*</span>
        </label>

        <div className={styles.inputWrapper}>
          <FiLock
            className={styles.inputIcon}
            aria-hidden="true"
          />

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(event) =>
              updateField("password", event.target.value)
            }
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() =>
              setShowPassword(!showPassword)
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword">
          Confirm password
          <span className={styles.required}>*</span>
        </label>

        <div className={styles.inputWrapper}>
          <FiLock
            className={styles.inputIcon}
            aria-hidden="true"
          />

          <input
            id="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            value={formData.confirmPassword}
            onChange={(event) =>
              updateField(
                "confirmPassword",
                event.target.value,
              )
            }
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword,
              )
            }
            aria-label={
              showConfirmPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className={styles.infoCard}>
        <FiShield aria-hidden="true" />

        <div>
          <strong>Secure account setup</strong>

          <p>
            Your password will be securely protected
            when authentication is connected.
          </p>
        </div>
      </div>
    </div>
  );
}

function BasicDetailsStep({
  formData,
  updateField,
}: StepProps) {
  return (
    <div className={styles.fieldsGrid}>
      <Field
        label="First name"
        id="firstName"
        value={formData.firstName}
        placeholder="Your first name"
        icon={<FiUser aria-hidden="true" />}
        onChange={(value) =>
          updateField("firstName", value)
        }
        required
      />

      <Field
        label="Last name"
        id="lastName"
        value={formData.lastName}
        placeholder="Your last name"
        onChange={(value) =>
          updateField("lastName", value)
        }
      />

      <SelectField
        label="Gender"
        id="gender"
        value={formData.gender}
        placeholder="Select gender"
        options={[
          "Man",
          "Woman",
          "Non-binary",
          "Prefer not to say",
        ]}
        onChange={(value) =>
          updateField("gender", value)
        }
        required
      />

      <div className={styles.field}>
        <label htmlFor="dateOfBirth">
          Date of birth
        </label>

        <div className={styles.inputWrapper}>
          <input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(event) =>
              updateField(
                "dateOfBirth",
                event.target.value,
              )
            }
            required
          />
        </div>
      </div>

      <StateCityField
          state={formData.state}
          city={formData.city}
          stateId="currentState"
          cityId="currentCity"
          onStateChange={(value) =>
            updateField("state", value)
          }
          onCityChange={(value) =>
            updateField("city", value)
          }
          required
        />

      <SelectField
        label="Religion"
        id="religion"
        value={formData.religion}
        placeholder="Select religion"
        options={[
          "Any",
          "Hindu",
          "Muslim",
          "Christian",
          "Sikh",
          "Buddhist",
          "Jain",
          "Jewish",
          "Zoroastrian (Parsi)",
          "Bahai",
          "Tribal",
          "Spiritual but not religious",
          "Other",
          "Prefer not to say"
        ]}
        onChange={(value) =>
          updateField("religion", value)
        }
      />

      <SelectField
        label="Mother tongue"
        id="motherTongue"
        value={formData.motherTongue}
        placeholder="Select mother tongue"
        options={[
          "Hindi",
          "English",
          "Punjabi",
          "Bengali",
          "Gujarati",
          "Marathi",
          "Tamil",
          "Telugu",
          "Kannada",
          "Malayalam",
          "Urdu",
          "Assamese",
          "Odia",
          "Konkani",
          "Rajasthani",
          "Haryanvi",
          "Bhojpuri",
          "Maithili",
          "Awadhi",
          "Chhattisgarhi",
          "Sindhi",
          "Kashmiri",
          "Manipuri (Meitei)",
          "Santhali",
          "Dogri",
          "Bodo",
          "Tulu",
          "Mizo",
          "Khasi",
          "Garo",
          "Tripuri",
          "Nagpuri",
          "Sourashtra",
          "Other",
        ]}
        onChange={(value) =>
          updateField("motherTongue", value)
        }
      />

      <SelectField
        label="Marital status"
        id="maritalStatus"
        value={formData.maritalStatus}
        placeholder="Select status"
        options={[
          "Never married",
          "Divorced",
          "Widowed",
          "Separated",
        ]}
        onChange={(value) =>
          updateField("maritalStatus", value)
        }
      />
    </div>
  );
}

function CareerStep({
  formData,
  updateField,
}: StepProps) {
  return (
    <div className={styles.fieldsGrid}>
      <SelectField
        label="Highest education"
        id="education"
        value={formData.education}
        placeholder="Select education"
        options={[
          "High school",
          "Intermediate / Higher secondary",
          "Diploma",
          "Vocational training",
          "Bachelor's degree",
          "Bachelor of Arts (BA)",
          "Bachelor of Science (BSc)",
          "Bachelor of Commerce (BCom)",
          "Bachelor of Engineering (BE)",
          "Bachelor of Technology (BTech)",
          "Bachelor of Computer Applications (BCA)",
          "Bachelor of Business Administration (BBA)",
          "Bachelor of Education (BEd)",
          "Bachelor of Fine Arts (BFA)",
          "Bachelor of Architecture (BArch)",
          "Bachelor of Pharmacy (BPharm)",
          "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
          "Master's degree",
          "Master of Arts (MA)",
          "Master of Science (MSc)",
          "Master of Commerce (MCom)",
          "Master of Engineering (ME)",
          "Master of Technology (MTech)",
          "Master of Computer Applications (MCA)",
          "Master of Business Administration (MBA)",
          "Master of Education (MEd)",
          "Master of Fine Arts (MFA)",
          "Master of Pharmacy (MPharm)",
          "Master of Public Health (MPH)",
          "Professional degree",
          "Chartered Accountant (CA)",
          "Company Secretary (CS)",
          "Cost Management Accountant (CMA)",
          "Law degree (LLB)",
          "Doctor of Medicine (MD)",
          "Doctor of Dental Surgery (DDS)",
          "Doctor of Pharmacy (PharmD)",
          "PhD / Doctorate",
          "Postdoctoral",
          "Other"
        ]}
        onChange={(value) =>
          updateField("education", value)
        }
        required
      />

      <Field
        label="College / University"
        id="college"
        value={formData.college}
        placeholder="Your institution"
        onChange={(value) =>
          updateField("college", value)
        }
      />

      <SelectField
        label="Profession"
        id="profession"
        value={formData.profession}
        placeholder="Select profession"
        options={[
          "Software / IT",
          "Engineering",
          "Healthcare",
          "Finance",
          "Education",
          "Business",
          "Government",
          "Design",
          "Marketing",
          "Sales",
          "Legal",
          "Media",
          "Student",
          "Accounting",
          "Human Resources",
          "Operations",
          "Customer Support",
          "Data & Analytics",
          "Research & Development",
          "Architecture",
          "Real Estate",
          "Hospitality",
          "Travel & Tourism",
          "Manufacturing",
          "Construction",
          "Skilled Trades",
          "Agriculture",
          "Transportation",
          "Security Services",
          "Entrepreneur / Self-employed",
          "Home-maker",
          "Retired",
          "Unemployed",
          "Other",
        ]}
        onChange={(value) =>
          updateField("profession", value)
        }
        required
      />

      <Field
        label="Company / Organization"
        id="company"
        value={formData.company}
        placeholder="Where do you work?"
        icon={<FiBriefcase aria-hidden="true" />}
        onChange={(value) =>
          updateField("company", value)
        }
      />

      <SelectField
        label="Annual income"
        id="income"
        value={formData.income}
        placeholder="Select income range"
        options={[
          "Prefer not to say",
          "Below ₹2 Lakh",
          "₹2 Lakh – ₹3 Lakh",
          "₹3 Lakh – ₹5 Lakh",
          "₹5 Lakh – ₹7.5 Lakh",
          "₹7.5 Lakh – ₹10 Lakh",
          "₹10 Lakh – ₹15 Lakh",
          "₹15 Lakh – ₹20 Lakh",
          "₹20 Lakh – ₹30 Lakh",
          "₹30 Lakh – ₹50 Lakh",
          "₹50 Lakh – ₹75 Lakh",
          "₹75 Lakh – ₹1 Crore",
          "Above ₹1 Crore"
        ]}
        onChange={(value) =>
          updateField("income", value)
        }
      />

      <div className={styles.infoCard}>
        <FiBriefcase aria-hidden="true" />

        <div>
          <strong>Your career is part of your story</strong>
          <p>
            Share only what you are comfortable
            making visible on your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

function FamilyLifestyleStep({
  formData,
  updateField,
}: StepProps) {
  return (
    <div className={styles.fieldsGrid}>
      {/* <SelectField
        label="Family type"
        id="familyType"
        value={formData.familyType}
        placeholder="Select family type"
        options={[
          "Nuclear",
          "Joint",
          "Extended",
          "Prefer not to say",
        ]}
        onChange={(value) =>
          updateField("familyType", value)
        }
        required
      /> */}

      <SelectField
        label="Family values"
        id="familyValues"
        value={formData.familyValues}
        placeholder="Select family values"
        options={[
          "Liberal",
          "Moderate",
          "Traditional",
          "Prefer not to say",
        ]}
        onChange={(value) =>
          updateField("familyValues", value)
        }
      />

      <Field
        label="Father's occupation"
        id="fatherOccupation"
        value={formData.fatherOccupation}
        placeholder="Optional"
        onChange={(value) =>
          updateField("fatherOccupation", value)
        }
      />

      <Field
        label="Mother's occupation"
        id="motherOccupation"
        value={formData.motherOccupation}
        placeholder="Optional"
        onChange={(value) =>
          updateField("motherOccupation", value)
        }
      />

      <SelectField
        label="Siblings"
        id="siblings"
        value={formData.siblings}
        placeholder="Select"
        options={[
          "Only child",
          "1 sibling",
          "2 siblings",
          "3+ siblings",
        ]}
        onChange={(value) =>
          updateField("siblings", value)
        }
      />

      <SelectField
        label="Lifestyle"
        id="lifestyle"
        value={formData.lifestyle}
        placeholder="Select lifestyle"
        options={[
          "Simple",
          "Moderate",
          "Active",
          "Social",
          "Luxury",
        ]}
        onChange={(value) =>
          updateField("lifestyle", value)
        }
        required
      />

      <SelectField
        label="Diet"
        id="diet"
        value={formData.diet}
        placeholder="Select diet"
        options={[
          "Vegetarian",
          "Non-vegetarian",
          "Vegan",
          "Eggetarian",
          "Other",
        ]}
        onChange={(value) =>
          updateField("diet", value)
        }
      />

      <SelectField
        label="Smoking"
        id="smoking"
        value={formData.smoking}
        placeholder="Select"
        options={[
          "Never",
          "Occasionally",
          "Regularly",
          "Prefer not to say",
        ]}
        onChange={(value) =>
          updateField("smoking", value)
        }
      />

      <SelectField
        label="Drinking"
        id="drinking"
        value={formData.drinking}
        placeholder="Select"
        options={[
          "Never",
          "Occasionally",
          "Regularly",
          "Prefer not to say",
        ]}
        onChange={(value) =>
          updateField("drinking", value)
        }
      />
    </div>
  );
}

function PartnerPreferencesStep({
  formData,
  updateField,
}: StepProps) {
  return (
    <div className={styles.preferenceLayout}>
      <div className={styles.preferenceIntro}>
        <div className={styles.preferenceIcon}>
          <FiHeart aria-hidden="true" />
        </div>

        <div>
          <h3>What are you looking for?</h3>
          <p>
            These preferences help personalize your
            discovery experience. You can change them
            later.
          </p>
        </div>
      </div>

      <div className={styles.fieldsGrid}>
        <SelectField
          label="Minimum age"
          id="partnerAgeMin"
          value={formData.partnerAgeMin}
          placeholder="Min age"
          options={[
            "21",
            "22",
            "23",
            "24",
            "25",
            "26",
            "27",
            "28",
            "29",
            "30",
            "31",
            "32",
            "33",
            "34",
            "35",
            "36",
            "37",
            "38",
            "39",
            "40",
          ]}
          onChange={(value) =>
            updateField("partnerAgeMin", value)
          }
        />

        <SelectField
          label="Maximum age"
          id="partnerAgeMax"
          value={formData.partnerAgeMax}
          placeholder="Max age"
          options={[
            "25",
            "26",
            "27",
            "28",
            "29",
            "30",
            "31",
            "32",
            "33",
            "34",
            "35",
            "36",
            "37",
            "38",
            "39",
            "40",
            "41",
            "42",
            "43",
            "44",
            "45",
            "46",
            "47",
            "48",
            "49",
            "50",
          ]}
          onChange={(value) =>
            updateField("partnerAgeMax", value)
          }
        />

        <StateCityField
          state={formData.partnerState}
          city={formData.partnerCity}
          stateId="partnerState"
          cityId="partnerCity"
          onStateChange={(value) =>
            updateField("partnerState", value)
          }
          onCityChange={(value) =>
            updateField("partnerCity", value)
          }
        />

        <SelectField
          label="Preferred religion"
          id="partnerReligion"
          value={formData.partnerReligion}
          placeholder="Any preference"
          options={[
            "Any",
            "Hindi",
            "English",
            "Punjabi",
            "Bengali",
            "Gujarati",
            "Marathi",
            "Tamil",
            "Telugu",
            "Kannada",
            "Malayalam",
            "Urdu",
            "Other",
            "Prefer not to say",
          ]}
          onChange={(value) =>
            updateField("partnerReligion", value)
          }
        />

        <SelectField
          label="Preferred education"
          id="partnerEducation"
          value={formData.partnerEducation}
          placeholder="Any preference"
          options={[
            "Any",
            "High school",
            "Diploma",
            "Bachelor's degree",
            "Master's degree",
            "MBA",
            "PhD",
            "Professional degree",
          ]}
          onChange={(value) =>
            updateField("partnerEducation", value)
          }
        />

        <SelectField
          label="Preferred profession"
          id="partnerProfession"
          value={formData.partnerProfession}
          placeholder="Any profession"
          options={[
            "Any",
            "Software / IT",
            "Engineering",
            "Healthcare",
            "Finance",
            "Education",
            "Business",
            "Government",
            "Design",
            "Marketing",
            "Other",
          ]}
          onChange={(value) =>
            updateField("partnerProfession", value)
          }
        />

        <SelectField
          label="Marital status"
          id="partnerMaritalStatus"
          value={formData.partnerMaritalStatus}
          placeholder="Any preference"
          options={[
            "Any",
            "Never married",
            "Divorced",
            "Widowed",
            "Separated",
          ]}
          onChange={(value) =>
            updateField(
              "partnerMaritalStatus",
              value,
            )
          }
        />

        <SelectField
          label="Lifestyle preference"
          id="partnerLifestyle"
          value={formData.partnerLifestyle}
          placeholder="Any preference"
          options={[
            "Any",
            "Simple",
            "Moderate",
            "Active",
            "Social",
            "Luxury",
          ]}
          onChange={(value) =>
            updateField(
              "partnerLifestyle",
              value,
            )
          }
        />
      </div>

      <div className={styles.preferenceNote}>
        <FiShield aria-hidden="true" />

        <p>
          Preferences are used to personalize
          recommendations. They don&apos;t limit your ability
          to explore profiles.
        </p>
      </div>
    </div>
  );
}

function PhotosStep({
  photos,
  onPhotoChange,
  onRemovePhoto,
}: {
  photos: string[];
  onPhotoChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  onRemovePhoto: (index: number) => void;
}) {
  return (
    <div className={styles.photosStep}>
      <div className={styles.photoIntro}>
        <div className={styles.photoMainIcon}>
          <FiImage aria-hidden="true" />
        </div>

        <h3>Add your photos</h3>

        <p>
          Profiles with genuine photos feel more personal.
          Add up to 6 photos and choose one that represents
          you well.
        </p>
      </div>

      <div className={styles.photoGrid}>
        {photos.map((photo, index) => (
          <div
            className={styles.photoItem}
            key={`${photo}-${index}`}
          >
            <img
              src={photo}
              alt={`Profile photo ${index + 1}`}
            />

            {index === 0 && (
              <span className={styles.primaryPhoto}>
                Main photo
              </span>
            )}

            <button
              type="button"
              className={styles.removePhoto}
              onClick={() => onRemovePhoto(index)}
              aria-label={`Remove photo ${
                index + 1
              }`}
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        ))}

        {photos.length < 6 && (
          <label className={styles.uploadBox}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPhotoChange}
            />

            <span className={styles.uploadIcon}>
              <FiPlus aria-hidden="true" />
            </span>

            <strong>Add photos</strong>

            <small>
              JPG, PNG or WebP
            </small>
          </label>
        )}
      </div>

      <div className={styles.photoTips}>
        <div>
          <FiCheck aria-hidden="true" />
          <span>Use clear, recent photos</span>
        </div>

        <div>
          <FiCheck aria-hidden="true" />
          <span>Choose genuine photos of yourself</span>
        </div>

        <div>
          <FiShield aria-hidden="true" />
          <span>You control who can see your photos</span>
        </div>
      </div>

      <div className={styles.photoPrivacy}>
        <FiLock aria-hidden="true" />

        <div>
          <strong>Photo privacy</strong>
          <p>
            Photo visibility controls can be configured
            after your account is created.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  placeholder,
  icon,
  onChange,
  required = false,
}: {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  icon?: React.ReactNode;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && (
          <span className={styles.required}>*</span>
        )}
      </label>

      <div className={styles.inputWrapper}>
        {icon && (
          <span className={styles.inputIcon}>
            {icon}
          </span>
        )}

        <input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={required}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  placeholder,
  options,
  onChange,
  required = false,
}: {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && (
          <span className={styles.required}>*</span>
        )}
      </label>

      <div className={styles.selectWrapper}>
        <select
          id={id}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={required}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              value={option}
              key={option}
            >
              {option}
            </option>
          ))}
        </select>

        <FiChevronDown
          aria-hidden="true"
          className={styles.selectIcon}
        />
      </div>
    </div>
  );
}