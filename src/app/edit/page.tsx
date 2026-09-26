"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
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

const initialForm: FormState = {
  name: "Akash Verma",
  age: "29",
  location: "Toronto, Canada",
  height: `5'9"`,
  maritalStatus: "Never married",
  motherTongue: "Hindi",

  about:
    "I’m a positive and easygoing person who values honesty, family, meaningful conversations and personal growth. I enjoy exploring new places, learning new things and maintaining a balanced lifestyle. I’m looking for a genuine connection built on trust, respect and understanding.",

  education: "Bachelor's Degree",
  fieldOfStudy: "Computer Science",
  institute: "University",

  profession: "Web Developer",
  employment: "Full-time",
  industry: "Technology",
  company: "",

  familyType: "Nuclear family",
  familyLocation: "Toronto, Canada",
  siblings: "1 sibling",

  diet: "Vegetarian",
  smoking: "Never",
  drinking: "Occasionally",

  preferredAgeMin: "26",
  preferredAgeMax: "33",
  preferredLocation: "Canada",
  preferredEducation: "Bachelor's or above",
  preferredProfession: "Any",
  preferredMaritalStatus: "Never married",
};

export default function EditProfilePage() {
  const [form, setForm] =
    useState<FormState>(initialForm);

  const [selectedInterests, setSelectedInterests] =
    useState<string[]>([
      "Travel",
      "Photography",
      "Music",
      "Movies",
      "Fitness",
      "Reading",
    ]);

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("basic");

  const [hasChanges, setHasChanges] =
    useState(false);

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
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter(
            (item) => item !== interest,
          )
        : [...current, interest],
    );

    setHasChanges(true);
    setIsSaved(false);
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);
    setHasChanges(true);
    setIsSaved(false);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setIsSaving(true);
    setIsSaved(false);

    // Future API:
    // PATCH /api/profiles/update
    //
    // {
    //   ...form,
    //   interests: selectedInterests
    // }

    await new Promise((resolve) =>
      setTimeout(resolve, 900),
    );

    setIsSaving(false);
    setIsSaved(true);
    setHasChanges(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleCancel = () => {
    setForm(initialForm);

    setSelectedInterests([
      "Travel",
      "Photography",
      "Music",
      "Movies",
      "Fitness",
      "Reading",
    ]);

    setProfileImage(null);
    setHasChanges(false);
    setIsSaved(false);
  };

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
      id: "interests",
      label: "Interests",
      icon: <FiHeart aria-hidden="true" />,
    },
    {
      id: "preferences",
      label: "Partner preferences",
      icon: <FiHeart aria-hidden="true" />,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        {/* Top bar */}

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
              href="/dashboard/profile/preview"
              className={styles.previewButton}
            >
              Preview profile
            </Link>
          </div>
        </div>

        {/* Page header */}

        <section className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              <FiUser aria-hidden="true" />
              Profile settings
            </span>

            <h1>Edit your profile</h1>

            <p>
              Keep your profile up to date so people can
              get to know the real you.
            </p>
          </div>

          <div className={styles.completionCard}>
            <div className={styles.completionCircle}>
              <strong>78%</strong>
            </div>

            <div>
              <strong>Profile completion</strong>

              <span>
                Add more details to improve your profile.
              </span>
            </div>
          </div>
        </section>

        <div className={styles.layout}>
          {/* Sidebar */}

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
                    onClick={() =>
                      setActiveSection(section.id)
                    }
                  >
                    <span className={styles.navIcon}>
                      {section.icon}
                    </span>

                    <span>{section.label}</span>

                    {activeSection ===
                      section.id && (
                      <FiCheck
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div className={styles.sidebarPrivacy}>
                <FiLock aria-hidden="true" />

                <div>
                  <strong>Your privacy</strong>

                  <span>
                    Only information you choose to
                    share appears on your profile.
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main form */}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            {/* Profile photo */}

            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiCamera aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Profile photo</h2>

                    <p>
                      A clear profile photo helps people
                      connect with you.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.photoEditor}>
                <div className={styles.profilePhoto}>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                    />
                  ) : (
                    <span>AV</span>
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

                <div className={styles.photoInfo}>
                  <strong>
                    Choose a profile photo
                  </strong>

                  <p>
                    Use a recent, clear photo where your
                    face is visible.
                  </p>

                  <span>
                    JPG, PNG or WebP · Maximum 5 MB
                  </span>

                  <label
                    htmlFor="profile-image"
                    className={
                      styles.uploadButton
                    }
                  >
                    <FiImage
                      aria-hidden="true"
                    />
                    Change photo
                  </label>
                </div>
              </div>

              <div className={styles.photoPrivacy}>
                <FiShield aria-hidden="true" />

                <span>
                  Your photo visibility can be controlled
                  from your privacy settings.
                </span>
              </div>
            </section>

            {/* Basic details */}

            <section
              id="basic"
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiUser aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Basic details</h2>

                    <p>
                      Tell people a little about who you
                      are.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  required
                />

                <Field
                  label="Age"
                  value={form.age}
                  type="number"
                  onChange={(value) =>
                    updateField("age", value)
                  }
                  required
                />

                <Field
                  label="Location"
                  value={form.location}
                  icon={
                    <FiMapPin
                      aria-hidden="true"
                    />
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
                  value={form.height}
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
                  value={form.maritalStatus}
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
                  value={form.motherTongue}
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
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiHeart aria-hidden="true" />
                  </span>

                  <div>
                    <h2>About me</h2>

                    <p>
                      Share what makes you unique.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.textareaWrapper}>
                <textarea
                  value={form.about}
                  onChange={(event) =>
                    updateField(
                      "about",
                      event.target.value,
                    )
                  }
                  maxLength={500}
                  rows={6}
                  placeholder="Tell people about yourself..."
                />

                <span>
                  {form.about.length}/500
                </span>
              </div>

              <div className={styles.tip}>
                <FiInfo aria-hidden="true" />

                <span>
                  Talk about your personality,
                  interests, values and what matters
                  to you. Avoid sharing phone numbers,
                  email addresses or other private
                  information.
                </span>
              </div>
            </section>

            {/* Education and career */}

            <section
              id="education"
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiInfo aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Education & career</h2>

                    <p>
                      Add your academic and professional
                      background.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className={styles.subTitle}>
                Education
              </h3>

              <div className={styles.fieldsGrid}>
                <SelectField
                  label="Highest education"
                  value={form.education}
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
                  value={form.fieldOfStudy}
                  onChange={(value) =>
                    updateField(
                      "fieldOfStudy",
                      value,
                    )
                  }
                />

                <Field
                  label="College / Institute"
                  value={form.institute}
                  onChange={(value) =>
                    updateField(
                      "institute",
                      value,
                    )
                  }
                />
              </div>

              <div className={styles.divider} />

              <h3 className={styles.subTitle}>
                Career
              </h3>

              <div className={styles.fieldsGrid}>
                <Field
                  label="Profession"
                  value={form.profession}
                  onChange={(value) =>
                    updateField(
                      "profession",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Employment type"
                  value={form.employment}
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
                  value={form.industry}
                  onChange={(value) =>
                    updateField(
                      "industry",
                      value,
                    )
                  }
                />

                <Field
                  label="Company"
                  value={form.company}
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
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiUser aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Family</h2>

                    <p>
                      Add general family information.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <SelectField
                  label="Family type"
                  value={form.familyType}
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
                  value={form.familyLocation}
                  onChange={(value) =>
                    updateField(
                      "familyLocation",
                      value,
                    )
                  }
                />

                <Field
                  label="Siblings"
                  value={form.siblings}
                  onChange={(value) =>
                    updateField(
                      "siblings",
                      value,
                    )
                  }
                />
              </div>

              <div className={styles.tip}>
                <FiLock aria-hidden="true" />

                <span>
                  Keep sensitive family details private.
                  Only share information you are
                  comfortable displaying.
                </span>
              </div>
            </section>

            {/* Lifestyle */}

            <section
              id="lifestyle"
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiShield aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Lifestyle</h2>

                    <p>
                      Share lifestyle choices that may
                      matter to you.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.fieldsGrid}>
                <SelectField
                  label="Diet"
                  value={form.diet}
                  options={lifestyleOptions.diet}
                  onChange={(value) =>
                    updateField(
                      "diet",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Smoking"
                  value={form.smoking}
                  options={lifestyleOptions.smoking}
                  onChange={(value) =>
                    updateField(
                      "smoking",
                      value,
                    )
                  }
                />

                <SelectField
                  label="Drinking"
                  value={form.drinking}
                  options={lifestyleOptions.drinking}
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
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiHeart aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Interests & hobbies</h2>

                    <p>
                      Select things you genuinely enjoy.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.interestList}>
                {interestOptions.map(
                  (interest) => {
                    const selected =
                      selectedInterests.includes(
                        interest,
                      );

                    return (
                      <button
                        type="button"
                        key={interest}
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

                        <span>{interest}</span>
                      </button>
                    );
                  },
                )}
              </div>

              <span className={styles.selectionCount}>
                {selectedInterests.length} interests
                selected
              </span>
            </section>

            {/* Partner preferences */}

            <section
              id="preferences"
              className={styles.card}
            >
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionIcon}>
                    <FiHeart aria-hidden="true" />
                  </span>

                  <div>
                    <h2>Partner preferences</h2>

                    <p>
                      Tell us what you are looking for.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.ageRange}>
                <div className={styles.ageLabel}>
                  <span>Preferred age range</span>

                  <strong>
                    {form.preferredAgeMin} –{" "}
                    {form.preferredAgeMax} years
                  </strong>
                </div>

                <div className={styles.ageFields}>
                  <Field
                    label="Minimum age"
                    value={form.preferredAgeMin}
                    type="number"
                    onChange={(value) =>
                      updateField(
                        "preferredAgeMin",
                        value,
                      )
                    }
                  />

                  <span className={styles.ageDash}>
                    —
                  </span>

                  <Field
                    label="Maximum age"
                    value={form.preferredAgeMax}
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

              <div className={styles.fieldsGrid}>
                <Field
                  label="Preferred location"
                  value={
                    form.preferredLocation
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

              <div className={styles.preferenceNote}>
                <FiInfo aria-hidden="true" />

                <span>
                  Preferences help us personalize your
                  recommendations. They do not guarantee
                  a specific match.
                </span>
              </div>
            </section>

            {/* Verification reminder */}

            <section className={styles.verificationCard}>
              <div className={styles.verificationIcon}>
                <FiShield aria-hidden="true" />
              </div>

              <div>
                <strong>
                  Want to build more trust?
                </strong>

                <p>
                  Complete your profile verification to
                  show verified information where
                  applicable.
                </p>
              </div>

              <Link href="/dashboard/verification">
                Verification
              </Link>
            </section>

            {/* Form actions */}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                <FiTrash2 aria-hidden="true" />
                <span>Discard changes</span>
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSaving}
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
                    <FiSave
                      aria-hidden="true"
                    />

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
          <div className={styles.successToast}>
            <span>
              <FiCheck aria-hidden="true" />
            </span>

            <div>
              <strong>Profile updated</strong>

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

/* Reusable field */

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
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label>
        <span>{label}</span>

        {required && (
          <small>Required</small>
        )}

        {optional && (
          <small>Optional</small>
        )}
      </label>

      <div className={styles.inputWrapper}>
        {icon && (
          <span className={styles.fieldIcon}>
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={required}
        />
      </div>
    </div>
  );
}

/* Reusable select */

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
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <FiChevronDown
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
