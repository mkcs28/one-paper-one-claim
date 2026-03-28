import mongoose from "mongoose";

const CoAuthorSchema = new mongoose.Schema({
  name:         { type: String, default: "" },
  department:   { type: String, default: "" },
  orgSelect:    { type: String, default: "" },   // "JSS Science and Technology University, Mysuru" | "Others"
  organization: { type: String, default: "" },   // custom name when orgSelect === "Others"
  email:        { type: String, default: "" },
  authorRole:   { type: String, default: "" },   // First Author / Co-Author / Corresponding Author
  collabType:   { type: String, default: "" },   // In-house / National / International
  country:      { type: String, default: "India" }, // kept for international collab scoring
}, { _id: false });

const PaperSchema = new mongoose.Schema(
  {
    /* Acknowledgement */
    ackNumber: { type: String, unique: true, required: true },

    /* Personal */
    prefix:       { type: String, default: "" },
    name:         { type: String, required: true, trim: true },
    empId:        { type: String, required: true, trim: true },
    designation:  { type: String, required: true },
    department:   { type: String, required: true },
    orgSelect:    { type: String, default: "" },   // "JSS Science and Technology University, Mysuru" | "Others"
    organization: { type: String, default: "" },   // custom org name when orgSelect === "Others"
    phone:        { type: String, default: "" },   // optional — kept for backwards compat
    email:        { type: String, required: true, lowercase: true, trim: true },

    /* Paper */
    paperTitle:  { type: String, required: true, trim: true },
    paperType:   { type: String, required: true },
    articleType: { type: String, default: "" },  // removed from form but kept for old records
    domainType:  { type: String, default: "" },  // removed from form but kept for old records
    authorType:  { type: String, required: true },
    authors:     { type: [CoAuthorSchema], default: [] },

    /* Journal */
    journal:        { type: String, required: true },
    publisher:      { type: String, required: true },
    publisherType:  { type: String, default: "" },
    publishingDate: { type: String, required: true }, // stored as "Month YYYY" e.g. "March 2024"
    accessType:     { type: String, default: "" },    // removed from form but kept for old records
    openAccessAmount: { type: String, default: "" },  // removed from form but kept for old records
    indexing:       { type: String, required: true },
    quartile:       { type: String, default: "" },

    /* DOI — mandatory from frontend */
    doi:               { type: String, default: "" },
    preprintAvailable: { type: String, default: "" },

    /* File */
    fileName: { type: String, default: "" },
  },
  { timestamps: true }
);

/* Case-insensitive duplicate check index */
PaperSchema.index(
  { paperTitle: 1, name: 1 },
  { unique: false }  // uniqueness enforced in route logic with normalized comparison
);

export default mongoose.model("Paper", PaperSchema);
