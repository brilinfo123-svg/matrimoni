"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  FiArrowLeft,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiHeart,
  FiImage,
  FiInfo,
  FiLock,
  FiMapPin,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

import styles from "./edit-profile.module.scss";

const interestOptions = [
  "Travel",
  "Photography",
  "Design",
  "Music",
  "Movies",
  "Cooking",
  "Fitness",
  "Reading",
  "Technology",
  "Nature",
  "Food",
  "Art",
];

const lifestyleOptions = {
  diet: [
    "Vegetarian",
    "Non-vegetarian",
    "Vegan",
    "Occasionally non-vegetarian",
  ],
  smoking: [
    "Never",
    "Occasionally",
    "Regularly",
  ],
  drinking: [
    "Never",
    "Occasionally",
    "Regularly",
  ],
};

type FormState = {
  name: string;
  age: string;
  location: string;
  height: string;
  maritalStatus: string;
  motherTongue: string;
  about: string;

  education: string;
  fieldOfStudy: string;
  institute: string;

  profession: string;
  employment: string;
  industry: string;
  company: string;

  familyType: string;
  familyLocation: string;
  siblings: string;

  diet: string;
  smoking: string;
  drinking: string;

  preferredAgeMin: string;
  preferredAgeMax: string;
  preferredLocation: string;
  preferredEducation: string;
  preferredProfession: string;
  preferredMaritalStatus: string;
};

type ProfileData = {
  id: string;

  name: string;
  age: string;
  location: string;
  height: string;
  maritalStatus: string;
  motherTongue: string;
  about: string;

  education: string;
  fieldOfStudy: string;
  institute: string;

  profession: string;
  employment: string;
  industry: string;
  company: string;

  familyType: string;
  familyLocation: string;
  siblings: string;

  diet: string;
  smoking: string;
  drinking: string;

  interests: string[];

  preferredAgeMin: string;
  preferredAgeMax: string;
  preferredLocation: string;
  preferredEducation: string;
  preferredProfession: string;
  preferredMaritalStatus: string;

  profileImage: string | null;
  photos: string[];

  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isProfileComplete: boolean;

  completion: number;
};

const emptyForm: FormState = {
  name: "",
  age: "",
  location: "",
  height: "",
  maritalStatus: "",
  motherTongue: "",
  about: "",

  education: "",
  fieldOfStudy: "",
  institute: "",

  profession: "",
  employment: "",
  industry: "",
  company: "",

  familyType: "",
  familyLocation: "",
  siblings: "",

  diet: "",
  smoking: "",
  drinking: "",

  preferredAgeMin: "",
  preferredAgeMax: "",
  preferredLocation: "",
  preferredEducation: "",
  preferredProfession: "",
  preferredMaritalStatus: "",
};

const defaultInterests: string[] = [];

function profileToForm(
  profile: ProfileData,
): FormState {
  return {
    name: profile.name || "",
    age: profile.age || "",
    location: profile.location || "",
    height: profile.height || "",
    maritalStatus:
      profile.maritalStatus || "",
    motherTongue:
      profile.motherTongue || "",
    about: profile.about || "",

    education:
      profile.education || "",
    fieldOfStudy:
      profile.fieldOfStudy || "",
    institute:
      profile.institute || "",

    profession:
      profile.profession || "",
    employment:
      profile.employment || "",
    industry:
      profile.industry || "",
    company:
      profile.company || "",

    familyType:
      profile.familyType || "",
    familyLocation:
      profile.familyLocation || "",
    siblings:
      profile.siblings || "",

    diet: profile.diet || "",
    smoking:
      profile.smoking || "",
    drinking:
      profile.drinking || "",

    preferredAgeMin:
      profile.preferredAgeMin || "",
    preferredAgeMax:
      profile.preferredAgeMax || "",
    preferredLocation:
      profile.preferredLocation || "",
    preferredEducation:
      profile.preferredEducation || "",
    preferredProfession:
      profile.preferredProfession || "",
    preferredMaritalStatus:
      profile.preferredMaritalStatus || "",
  };
}

export default function EditProfilePage() {
  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [savedForm, setSavedForm] =
    useState<FormState>(emptyForm);

  const [
    selectedInterests,
    setSelectedInterests,
  ] = useState<string[]>(
    defaultInterests,
  );

  const [
    savedInterests,
    setSavedInterests,
  ] = useState<string[]>(
    defaultInterests,
  );

  const [
    profileImage,
    setProfileImage,
  ] = useState<string | null>(null);

  const [
    savedProfileImage,
    setSavedProfileImage,
  ] = useState<string | null>(
    null,
  );

  const [
    completion,
    setCompletion,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isSaved,
    setIsSaved,
  ] = useState(false);

  const [
    showSuccess,
    setShowSuccess,
  ] = useState(false);

  const [
    activeSection,
    setActiveSection,
  ] = useState("basic");

  const [
    hasChanges,
    setHasChanges,
  ] = useState(false);

  /*
   * ------------------------------------------
   * LOAD PROFILE
   * ------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadProfile =
      async () => {
        try {
          setIsLoading(true);
          setLoadError("");

          const response =
            await fetch(
              "/api/profiles",
              {
                method: "GET",
                credentials:
                  "include",
                cache: "no-store",
              },
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to load profile.",
            );
          }

          if (!mounted) {
            return;
          }

          const profile =
            data.profile as ProfileData;

          const loadedForm =
            profileToForm(
              profile,
            );

          const loadedInterests =
            Array.isArray(
              profile.interests,
            )
              ? profile.interests
              : [];

          setForm(loadedForm);
          setSavedForm(
            loadedForm,
          );

          setSelectedInterests(
            loadedInterests,
          );
          setSavedInterests(
            loadedInterests,
          );

          setProfileImage(
            profile.profileImage ||
              null,
          );
          setSavedProfileImage(
            profile.profileImage ||
              null,
          );

          setCompletion(
            Number(
              profile.completion || 0,
            ),
          );

          setHasChanges(false);
        } catch (error) {
          console.error(
            "Load profile error:",
            error,
          );

          if (
            mounted
          ) {
            setLoadError(
              error instanceof
                Error
                ? error.message
                : "Unable to load profile.",
            );
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ------------------------------------------
   * UPDATE FIELD
   * ------------------------------------------
   */

  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setHasChanges(true);
    setIsSaved(false);
    setSaveError("");
  };

  /*
   * ------------------------------------------
   * INTERESTS
   * ------------------------------------------
   */

  const toggleInterest = (
    interest: string,
  ) => {
    setSelectedInterests(
      (current) =>
        current.includes(interest)
          ? current.filter(
              (item) =>
                item !== interest,
            )
          : [
              ...current,
              interest,
            ],
    );

    setHasChanges(true);
    setIsSaved(false);
    setSaveError("");
  };

  /*
   * ------------------------------------------
   * IMAGE
   * ------------------------------------------
   */

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setSaveError(
        "Image size must be less than 5 MB.",
      );

      event.target.value = "";

      return;
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setSaveError(
        "Please select a JPG, PNG or WebP image.",
      );

      event.target.value = "";

      return;
    }

    const imageUrl =
      URL.createObjectURL(file);

    setProfileImage(imageUrl);
    setHasChanges(true);
    setIsSaved(false);
    setSaveError("");
  };

  /*
   * ------------------------------------------
   * SAVE PROFILE
   * ------------------------------------------
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setIsSaved(false);
    setSaveError("");

    try {
      const response =
        await fetch(
          "/api/profiles",
          {
            method: "PATCH",
            credentials:
              "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              ...form,
              interests:
                selectedInterests,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update profile.",
        );
      }

      const profile =
        data.profile as ProfileData;

      const updatedForm =
        profileToForm(
          profile,
        );

      const updatedInterests =
        Array.isArray(
          profile.interests,
        )
          ? profile.interests
          : [];

      setForm(updatedForm);
      setSavedForm(
        updatedForm,
      );

      setSelectedInterests(
        updatedInterests,
      );
      setSavedInterests(
        updatedInterests,
      );

      setProfileImage(
        profile.profileImage ||
          null,
      );
      setSavedProfileImage(
        profile.profileImage ||
          null,
      );

      setCompletion(
        Number(
          profile.completion || 0,
        ),
      );

      setIsSaving(false);
      setIsSaved(true);
      setHasChanges(false);
      setShowSuccess(true);

      window.setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Save profile error:",
        error,
      );

      setIsSaving(false);

      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to update profile.",
      );
    }
  };

  /*
   * ------------------------------------------
   * DISCARD CHANGES
   * ------------------------------------------
   */

  const handleCancel = () => {
    setForm(savedForm);

    setSelectedInterests(
      savedInterests,
    );

    setProfileImage(
      savedProfileImage,
    );

    setHasChanges(false);
    setIsSaved(false);
    setSaveError("");
  };

  /*
   * ------------------------------------------
   * NAVIGATION
   * ------------------------------------------
   */

  const sections = [
    {
      id: "basic",
      label: "Basic details",
      icon: (
        <FiUser aria-hidden="true" />
      ),
    },
    {
      id: "about",
      label: "About me",
      icon: (
        <FiHeart aria-hidden="true" />
      ),
    },
    {
      id: "education",
      label: "Education & career",
      icon: (
        <FiInfo aria-hidden="true" />
      ),
    },
    {
      id: "family",
      label: "Family",
      icon: (
        <FiUser aria-hidden="true" />
      ),
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      icon: (
        <FiShield aria-hidden="true" />
      ),
    },
    {
      id: "interests",
      label: "Interests",
      icon: (
        <FiHeart aria-hidden="true" />
      ),
    },
    {
      id: "preferences",
      label: "Partner preferences",
      icon: (
        <FiHeart aria-hidden="true" />
      ),
    },
  ];

  /*
   * ------------------------------------------
   * LOADING
   * ------------------------------------------
   */

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div
          className={
            styles.backgroundGlow
          }
        />

        <div
          className={
            styles.backgroundGlowTwo
          }
        />

        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.loadingState
            }
          >
            <span
              className={
                styles.spinner
              }
            />

            <strong>
              Loading your profile...
            </strong>

            <p>
              Please wait while we
              fetch your profile
              details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------
   * ERROR
   * ------------------------------------------
   */

  if (loadError) {
    return (
      <main className={styles.page}>
        <div
          className={
            styles.backgroundGlow
          }
        />

        <div
          className={
            styles.backgroundGlowTwo
          }
        />

        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.errorState
            }
          >
            <span>
              <FiInfo aria-hidden="true" />
            </span>

            <h1>
              Unable to load profile
            </h1>

            <p>
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
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
      <div
        className={
          styles.backgroundGlow
        }
      />

      <div
        className={
          styles.backgroundGlowTwo
        }
      />

      <div
        className={
          styles.container
        }
      >
        {/* Top bar */}

        <div className={styles.topBar}>
          <Link
            href="/dashboard/profile"
            className={
              styles.backButton
            }
          >
            <FiArrowLeft aria-hidden="true" />

            <span>
              Back to profile
            </span>
          </Link>

          <div
            className={
              styles.topActions
            }
          >
            {hasChanges && (
              <span
                className={
                  styles.unsaved
                }
              >
                Unsaved changes
              </span>
            )}

            {isSaved && (
              <span
                className={
                  styles.saved
                }
              >
                <FiCheck aria-hidden="true" />
                Saved
              </span>
            )}

            <Link
              href="/preview"
              className={
                styles.previewButton
              }
            >
              Preview profile
            </Link>
          </div>
        </div>

        {/* Page header */}

        <section
          className={
            styles.pageHeader
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              <FiUser aria-hidden="true" />

              Profile settings
            </span>

            <h1>
              Edit your profile
            </h1>

            <p>
              Keep your profile up to date
              so people can get to know
              the real you.
            </p>
          </div>

          <div
            className={
              styles.completionCard
            }
          >
            <div
              className={
                styles.completionCircle
              }
            >
              <strong>
                {completion}%
              </strong>
            </div>

            <div>
              <strong>
                Profile completion
              </strong>

              <span>
                {completion >= 80
                  ? "Your profile looks great."
                  : "Add more details to improve your profile."}
              </span>
            </div>
          </div>
        </section>

        {saveError && (
          <div
            className={
              styles.errorBanner
            }
          >
            <FiInfo aria-hidden="true" />

            <span>
              {saveError}
            </span>
          </div>
        )}

        <div className={styles.layout}>
          {/* Sidebar */}

          <aside
            className={
              styles.sidebar
            }
          >
            <div
              className={
                styles.sidebarInner
              }
            >
              <span
                className={
                  styles.sidebarTitle
                }
              >
                Profile sections
              </span>

              <nav>
                {sections.map(
                  (section) => (
                    <button
                      type="button"
                      key={
                        section.id
                      }
                      className={
                        activeSection ===
                        section.id
                          ? styles.activeNav
                          : ""
                      }
                      onClick={() =>
                        setActiveSection(
                          section.id,
                        )
                      }
                    >
                      <span
                        className={
                          styles.navIcon
                        }
                      >
                        {
                          section.icon
                        }
                      </span>

                      <span>
                        {
                          section.label
                        }
                      </span>

                      {activeSection ===
                        section.id && (
                        <FiCheck
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ),
                )}
              </nav>

              <div
                className={
                  styles.sidebarPrivacy
                }
              >
                <FiLock aria-hidden="true" />

                <div>
                  <strong>
                    Your privacy
                  </strong>

                  <span>
                    Only information you
                    choose to share appears
                    on your profile.
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main form */}

          <form
            className={styles.form}
            onSubmit={
              handleSubmit
            }
          >
            {/* Profile photo */}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiCamera aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      Profile photo
                    </h2>

                    <p>
                      A clear profile photo
                      helps people connect
                      with you.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.photoEditor
                }
              >
                <div
                  className={
                    styles.profilePhoto
                  }
                >
                  {profileImage ? (
                    <img
                      src={
                        profileImage
                      }
                      alt="Profile preview"
                    />
                  ) : (
                    <span>
                      {getInitials(
                        form.name,
                      )}
                    </span>
                  )}

                  <label
                    htmlFor="profile-image"
                    className={
                      styles.cameraButton
                    }
                    title="Change profile photo"
                  >
                    <FiCamera aria-hidden="true" />

                    <input
                      id="profile-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleImageChange
                      }
                    />
                  </label>
                </div>

                <div
                  className={
                    styles.photoInfo
                  }
                >
                  <strong>
                    Choose a profile photo
                  </strong>

                  <p>
                    Use a recent, clear photo
                    where your face is visible.
                  </p>

                  <span>
                    JPG, PNG or WebP · Maximum
                    5 MB
                  </span>

                  <label
                    htmlFor="profile-image"
                    className={
                      styles.uploadButton
                    }
                  >
                    <FiImage aria-hidden="true" />

                    Change photo
                  </label>
                </div>
              </div>

              <div
                className={
                  styles.photoPrivacy
                }
              >
                <FiShield aria-hidden="true" />

                <span>
                  Your photo visibility can
                  be controlled from your
                  privacy settings.
                </span>
              </div>
            </section>

            {/* Basic details */}

            <section
              id="basic"
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiUser aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      Basic details
                    </h2>

                    <p>
                      Tell people a little
                      about who you are.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(value) =>
                    updateField(
                      "name",
                      value,
                    )
                  }
                  required
                />

                <Field
                  label="Age"
                  value={form.age}
                  type="number"
                  onChange={() => {
                    /*
                     * Age is calculated from
                     * date of birth and is not
                     * saved independently.
                     */
                  }}
                  required
                />

                <Field
                  label="Location"
                  value={
                    form.location
                  }
                  icon={
                    <FiMapPin aria-hidden="true" />
                  }
                  onChange={(value) =>
                    updateField(
                      "location",
                      value,
                    )
                  }
                  required
                />

                <SelectField
                  label="Height"
                  value={
                    form.height
                  }
                  options={[
                    `5'0"`,
                    `5'2"`,
                    `5'4"`,
                    `5'6"`,
                    `5'8"`,
                    `5'9"`,
                    `5'10"`,
                    `6'0"`,
                  ]}
                  onChange={(value) =>
                    updateField(
                      "height",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Marital status"
                  value={
                    form.maritalStatus
                  }
                  options={[
                    "Never married",
                    "Divorced",
                    "Widowed",
                    "Separated",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "maritalStatus",
                      value,
                    )
                  }
                />

                <Field
                  label="Mother tongue"
                  value={
                    form.motherTongue
                  }
                  onChange={(value) =>
                    updateField(
                      "motherTongue",
                      value,
                    )
                  }
                />
              </div>
            </section>

            {/* About */}

            <section
              id="about"
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiHeart aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      About me
                    </h2>

                    <p>
                      Share what makes you
                      unique.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.textareaWrapper
                }
              >
                <textarea
                  value={
                    form.about
                  }
                  onChange={(event) =>
                    updateField(
                      "about",
                      event.target
                        .value,
                    )
                  }
                  maxLength={500}
                  rows={6}
                  placeholder="Tell people about yourself..."
                />

                <span>
                  {
                    form.about
                      .length
                  }
                  /500
                </span>
              </div>

              <div
                className={
                  styles.tip
                }
              >
                <FiInfo aria-hidden="true" />

                <span>
                  Talk about your personality,
                  interests, values and what
                  matters to you. Avoid sharing
                  phone numbers, email addresses
                  or other private information.
                </span>
              </div>
            </section>

            {/* Education and career */}

            <section
              id="education"
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiInfo aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      Education & career
                    </h2>

                    <p>
                      Add your academic and
                      professional background.
                    </p>
                  </div>
                </div>
              </div>

              <h3
                className={
                  styles.subTitle
                }
              >
                Education
              </h3>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <SelectField
                  label="Highest education"
                  value={
                    form.education
                  }
                  options={[
                    "High school",
                    "Diploma",
                    "Bachelor's Degree",
                    "Master's Degree",
                    "Doctorate",
                    "Other",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "education",
                      value,
                    )
                  }
                />

                <Field
                  label="Field of study"
                  value={
                    form.fieldOfStudy
                  }
                  onChange={(value) =>
                    updateField(
                      "fieldOfStudy",
                      value,
                    )
                  }
                />

                <Field
                  label="College / Institute"
                  value={
                    form.institute
                  }
                  onChange={(value) =>
                    updateField(
                      "institute",
                      value,
                    )
                  }
                />
              </div>

              <div
                className={
                  styles.divider
                }
              />

              <h3
                className={
                  styles.subTitle
                }
              >
                Career
              </h3>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <Field
                  label="Profession"
                  value={
                    form.profession
                  }
                  onChange={(value) =>
                    updateField(
                      "profession",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Employment type"
                  value={
                    form.employment
                  }
                  options={[
                    "Full-time",
                    "Part-time",
                    "Self-employed",
                    "Business owner",
                    "Freelancer",
                    "Not working",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "employment",
                      value,
                    )
                  }
                />

                <Field
                  label="Industry"
                  value={
                    form.industry
                  }
                  onChange={(value) =>
                    updateField(
                      "industry",
                      value,
                    )
                  }
                />

                <Field
                  label="Company"
                  value={
                    form.company
                  }
                  onChange={(value) =>
                    updateField(
                      "company",
                      value,
                    )
                  }
                  optional
                />
              </div>
            </section>

            {/* Family */}

            <section
              id="family"
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiUser aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      Family
                    </h2>

                    <p>
                      Add general family
                      information.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <SelectField
                  label="Family type"
                  value={
                    form.familyType
                  }
                  options={[
                    "Nuclear family",
                    "Joint family",
                    "Extended family",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "familyType",
                      value,
                    )
                  }
                />

                <Field
                  label="Family location"
                  value={
                    form.familyLocation
                  }
                  onChange={(value) =>
                    updateField(
                      "familyLocation",
                      value,
                    )
                  }
                />

                <Field
                  label="Siblings"
                  value={
                    form.siblings
                  }
                  onChange={(value) =>
                    updateField(
                      "siblings",
                      value,
                    )
                  }
                />
              </div>

              <div
                className={
                  styles.tip
                }
              >
                <FiLock aria-hidden="true" />

                <span>
                  Keep sensitive family details
                  private. Only share information
                  you are comfortable displaying.
                </span>
              </div>
            </section>

            {/* Lifestyle */}

            <section
              id="lifestyle"
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiShield aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      Lifestyle
                    </h2>

                    <p>
                      Share lifestyle choices
                      that may matter to you.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <SelectField
                  label="Diet"
                  value={
                    form.diet
                  }
                  options={
                    lifestyleOptions.diet
                  }
                  onChange={(value) =>
                    updateField(
                      "diet",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Smoking"
                  value={
                    form.smoking
                  }
                  options={
                    lifestyleOptions.smoking
                  }
                  onChange={(value) =>
                    updateField(
                      "smoking",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Drinking"
                  value={
                    form.drinking
                  }
                  options={
                    lifestyleOptions.drinking
                  }
                  onChange={(value) =>
                    updateField(
                      "drinking",
                      value,
                    )
                  }
                />
              </div>
            </section>

            {/* Interests */}

            <section
              id="interests"
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiHeart aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      Interests & hobbies
                    </h2>

                    <p>
                      Select things you
                      genuinely enjoy.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.interestList
                }
              >
                {interestOptions.map(
                  (interest) => {
                    const selected =
                      selectedInterests.includes(
                        interest,
                      );

                    return (
                      <button
                        type="button"
                        key={
                          interest
                        }
                        className={
                          selected
                            ? styles.selectedInterest
                            : ""
                        }
                        onClick={() =>
                          toggleInterest(
                            interest,
                          )
                        }
                      >
                        {selected && (
                          <FiCheck
                            aria-hidden="true"
                          />
                        )}

                        <span>
                          {
                            interest
                          }
                        </span>
                      </button>
                    );
                  },
                )}
              </div>

              <span
                className={
                  styles.selectionCount
                }
              >
                {
                  selectedInterests.length
                }{" "}
                interests selected
              </span>
            </section>

            {/* Partner preferences */}

            <section
              id="preferences"
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionIcon
                    }
                  >
                    <FiHeart aria-hidden="true" />
                  </span>

                  <div>
                    <h2>
                      Partner preferences
                    </h2>

                    <p>
                      Tell us what you are
                      looking for.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.ageRange
                }
              >
                <div
                  className={
                    styles.ageLabel
                  }
                >
                  <span>
                    Preferred age range
                  </span>

                  <strong>
                    {form.preferredAgeMin ||
                      "—"}{" "}
                    –{" "}
                    {form.preferredAgeMax ||
                      "—"}{" "}
                    years
                  </strong>
                </div>

                <div
                  className={
                    styles.ageFields
                  }
                >
                  <Field
                    label="Minimum age"
                    value={
                      form.preferredAgeMin
                    }
                    type="number"
                    onChange={(value) =>
                      updateField(
                        "preferredAgeMin",
                        value,
                      )
                    }
                  />

                  <span
                    className={
                      styles.ageDash
                    }
                  >
                    —
                  </span>

                  <Field
                    label="Maximum age"
                    value={
                      form.preferredAgeMax
                    }
                    type="number"
                    onChange={(value) =>
                      updateField(
                        "preferredAgeMax",
                        value,
                      )
                    }
                  />
                </div>
              </div>

              <div
                className={
                  styles.fieldsGrid
                }
              >
                <Field
                  label="Preferred location"
                  value={
                    form.preferredLocation
                  }
                  icon={
                    <FiMapPin aria-hidden="true" />
                  }
                  onChange={(value) =>
                    updateField(
                      "preferredLocation",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Education"
                  value={
                    form.preferredEducation
                  }
                  options={[
                    "Any",
                    "Bachelor's or above",
                    "Master's or above",
                    "Doctorate",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "preferredEducation",
                      value,
                    )
                  }
                />

                <Field
                  label="Profession"
                  value={
                    form.preferredProfession
                  }
                  onChange={(value) =>
                    updateField(
                      "preferredProfession",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Marital status"
                  value={
                    form.preferredMaritalStatus
                  }
                  options={[
                    "Any",
                    "Never married",
                    "Divorced",
                    "Widowed",
                  ]}
                  onChange={(value) =>
                    updateField(
                      "preferredMaritalStatus",
                      value,
                    )
                  }
                />
              </div>

              <div
                className={
                  styles.preferenceNote
                }
              >
                <FiInfo aria-hidden="true" />

                <span>
                  Preferences help us personalize
                  your recommendations. They do
                  not guarantee a specific match.
                </span>
              </div>
            </section>

            {/* Verification */}

            <section
              className={
                styles.verificationCard
              }
            >
              <div
                className={
                  styles.verificationIcon
                }
              >
                <FiShield aria-hidden="true" />
              </div>

              <div>
                <strong>
                  Want to build more trust?
                </strong>

                <p>
                  Complete your profile
                  verification to show verified
                  information where applicable.
                </p>
              </div>

              <Link
                href="/dashboard/verification"
              >
                Verification
              </Link>
            </section>

            {/* Form actions */}

            <div
              className={
                styles.formActions
              }
            >
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={
                  handleCancel
                }
                disabled={
                  isSaving ||
                  !hasChanges
                }
              >
                <FiTrash2 aria-hidden="true" />

                <span>
                  Discard changes
                </span>
              </button>

              <button
                type="submit"
                className={
                  styles.saveButton
                }
                disabled={
                  isSaving ||
                  !hasChanges
                }
              >
                {isSaving ? (
                  <>
                    <span
                      className={
                        styles.spinner
                      }
                    />

                    <span>
                      Saving changes...
                    </span>
                  </>
                ) : (
                  <>
                    <FiSave aria-hidden="true" />

                    <span>
                      Save changes
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success toast */}

        {showSuccess && (
          <div
            className={
              styles.successToast
            }
          >
            <span>
              <FiCheck aria-hidden="true" />
            </span>

            <div>
              <strong>
                Profile updated
              </strong>

              <p>
                Your changes have been saved
                successfully.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/*
 * ------------------------------------------
 * INITIALS
 * ------------------------------------------
 */

function getInitials(
  name: string,
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

/*
 * ------------------------------------------
 * REUSABLE FIELD
 * ------------------------------------------
 */

function Field({
  label,
  value,
  onChange,
  type = "text",
  icon,
  required = false,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  const isReadOnly =
    label === "Age";

  return (
    <div
      className={
        styles.field
      }
    >
      <label>
        <span>
          {label}
        </span>

        {required && (
          <small>
            Required
          </small>
        )}

        {optional && (
          <small>
            Optional
          </small>
        )}
      </label>

      <div
        className={
          styles.inputWrapper
        }
      >
        {icon && (
          <span
            className={
              styles.fieldIcon
            }
          >
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          required={
            required
          }
          readOnly={
            isReadOnly
          }
        />
      </div>
    </div>
  );
}

/*
 * ------------------------------------------
 * REUSABLE SELECT
 * ------------------------------------------
 */

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (
    value: string,
  ) => void;
}) {
  /*
   * If database contains a value
   * that isn't currently in our
   * options, keep it visible.
   */
  const selectOptions =
    value &&
    !options.includes(value)
      ? [value, ...options]
      : options;

  return (
    <div
      className={
        styles.field
      }
    >
      <label>
        <span>
          {label}
        </span>
      </label>

      <div
        className={
          styles.selectWrapper
        }
      >
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
        >
          {!value && (
            <option
              value=""
              disabled
            >
              Select {label}
            </option>
          )}

          {selectOptions.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ),
          )}
        </select>

        <FiChevronDown
          aria-hidden="true"
        />
      </div>
    </div>
  );
}