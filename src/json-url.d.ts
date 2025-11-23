declare module 'json-url' {
  type JsonUrl = (codec: string) => {
    compress: (input: object) => Promise<string>;
    decompress: (input: string) => Promise<object>;
  };

  const jsonUrl: JsonUrl;

  export default jsonUrl;
}
