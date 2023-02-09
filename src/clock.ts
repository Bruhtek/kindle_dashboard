export const clockHelper = {
	getHHMM: (date: Date) => {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const pad = (n: number) => n < 10 ? `0${n}` : n;
		return `${pad(hours)}:${pad(minutes)}`;
	},
	getFormattedDate: (date: Date) => {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}
}