import {Dimensions, StyleSheet} from 'react-native';
import { Fonts, Colors, Spacing, BorderRadius } from '../../globalStyles';

const {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
	calendar: {
		marginBottom: Spacing.l,
		borderWidth: 1,
		borderColor: Colors.lightGray,
		height: height / 2.2,
		alignSelf: 'center',
		width: width - 40,
		borderRadius: BorderRadius.lg,
		backgroundColor: Colors.white,
	},
	customHeader: {
		fontSize: 32,
		fontWeight: '600',
		color: Colors.text,
		textAlign: 'center',
		fontFamily: Fonts.PFbold,
		marginVertical: Spacing.m,
	},
	calendarContainer: {
		padding: Spacing.m,
		backgroundColor: Colors.white,
		borderRadius: BorderRadius.lg,
	},
});

export default styles;
