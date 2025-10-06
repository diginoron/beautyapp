import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center py-6 px-4 bg-transparent mt-auto border-t border-slate-200">
            <div className="container mx-auto">
                <p className="text-sm text-slate-500">
                    سلب مسئولیت: این تحلیل توسط هوش مصنوعی تولید شده و صرفاً برای اهداف سرگرمی است. این به منزله مشاوره پزشکی نیست. زیبایی واقعی امری ذهنی و منحصر به فرد برای هر فرد است.
                </p>
                <p className="text-xs text-slate-600 mt-2">
                    Powered by Diginoron
                </p>
            </div>
        </footer>
    );
};

export default Footer;