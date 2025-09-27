export abstract class SetStorage {
    
    abstract has (key: string): Promise<boolean>;
    abstract add (key: string): Promise<void>;
    abstract remove (key: string): Promise<void>;

}