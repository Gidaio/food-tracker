export class HTTPError extends Error {
    private status: number;

    public get Status() {
        return this.status;
    }

    public constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
