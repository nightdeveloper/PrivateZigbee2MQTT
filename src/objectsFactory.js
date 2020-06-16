import MemoryPersistence from "aedes-persistence"

export const getInMemoryPersistence = () => {
    return new MemoryPersistence();
};