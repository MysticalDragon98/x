export type PostmanWorkspace = {
    id: string;
    name: string;
    type: "personal" | "team";
    visibility: "personal" | "team" | "public";
    about: string;
    createdBy: string;
}